package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.dto.cart.CartDto;
import cz.upce.fei.TicketApp.dto.cart.CartItemDto;
import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.exception.CapacityExceededException;
import cz.upce.fei.TicketApp.exception.SeatAlreadyTakenException;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final UserRepository users;
    private final EventRepository events;
    private final SeatRepository seats;
    private final TicketRepository tickets;
    private final CartRepository carts;

    // ====== READ ======
    @Transactional(readOnly = true)
    public CartDto getMyCart(String email) {
        Cart cart = carts.findByUserEmail(email)
                .orElseGet(() -> createCartFor(email)); // lazy create i při čtení je OK
        return mapCart(cart);
    }

    // ====== ADD ======

    /**
     * 1 - standing se řeší přes zámek na event id (když někdo dělá cokoliv na eventu 1 a přijde někdo druhej,
     *    tak se mu ten dotaz zmrazí)
     * 2 - seating nemá zámek, ale pouze constraint UNIQUE(event_id, seat_id) na úrovni DB,
     *    který zamezuje přidat více ticketů na jeden seat v eventu
     *
     *    všechno je transactional, takže by se to v případě chyby mělo rollbacknout
     */
    public CartDto addItem(String email, CartAddItemDto dto) {
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen: " + email));

        Cart cart = carts.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        Event event = events.findById(dto.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event nenalezen: " + dto.getEventId()));

        if (dto.getSeatId() == null) {

            int qty = dto.getQuantity() == null ? 1 : dto.getQuantity();
            if (qty <= 0) {
                throw new IllegalArgumentException("Množství musí být kladné.");
            }
            return addStanding(cart, event, qty);

        } else {
            // SEATING
            try {
                Seat seat = seats.findById(dto.getSeatId())
                        .orElseThrow(() -> new EntityNotFoundException("Sedadlo nenalezeno: " + dto.getSeatId()));

                Ticket ticket = Ticket.builder()
                        .event(event)
                        .seat(seat)
                        .cart(cart)
                        .ticketCode(genCode(event.getId()))
                        .price(event.getSeatingPrice())
                        .status(TicketStatus.RESERVED)
                        .build();

                tickets.save(ticket);

                cart.getTickets().add(ticket);
                carts.save(cart);

            } catch (DataIntegrityViolationException e) {
                // UNIQUE constraint na (event_id, seat_id) porušen = sedadlo je obsazeno
                throw new SeatAlreadyTakenException("Zadané sedadlo je již obsazeno.");
            }
            return mapCart(cart);
        }
    }

    // ====== REMOVE ======
    public CartDto removeItem(String email, Long ticketId) {
        Ticket t = tickets.findByIdAndCartUserEmail(ticketId, email)
                .orElseThrow(() -> new IllegalArgumentException("Položka košíku nenalezena"));

        tickets.delete(t);

        Cart cart = carts.findByUserEmail(email).orElseThrow();
        return mapCart(cart);
    }


    /**
     * Privátní metoda pro řešení souběhu (Concurrency)
     */
    private CartDto addStanding(Cart cart, Event event, int qty) {
        Event lockedEvent = events.findByIdWithLock(event.getId())
                .orElseThrow(() -> new EntityNotFoundException("Event nenalezen při zamykání"));

        if (lockedEvent.getStandingPrice() == null) {
            throw new IllegalArgumentException("Event nemá cenu pro stání.");
        }
        Integer venueCap = lockedEvent.getVenue().getStandingCapacity();
        int cap = venueCap == null ? 0 : venueCap;
        if (cap <= 0) {
            throw new IllegalArgumentException("Event/venue nemá kapacitu pro stání.");
        }

        long alreadyHeld = tickets.countByEventIdAndStatusIn(
                lockedEvent.getId(),
                List.of(TicketStatus.RESERVED, TicketStatus.ISSUED, TicketStatus.USED)
        );

        long remaining = cap - alreadyHeld;
        if (remaining < qty) {
            throw new CapacityExceededException(
                    "Nedostatečná kapacita pro stání. Požadováno: " + qty + ", Zbývá: " + remaining
            );
        }

        BigDecimal price = lockedEvent.getStandingPrice();
        for (int i = 0; i < qty; i++) {
            Ticket t = Ticket.builder()
                    .event(lockedEvent)
                    .seat(null)
                    .cart(cart)
                    .ticketCode(genCode(lockedEvent.getId()))
                    .price(price)
                    .status(TicketStatus.RESERVED)
                    .build();
            tickets.save(t);
        }

        Cart reloaded = carts.findById(cart.getId()).orElseThrow();
        return mapCart(reloaded);
    }

    // --- Helpers ---

    private String genCode(Long eventId) {
        return "E" + eventId + "-" + System.nanoTime();
    }

    private Cart createCartFor(String email) {
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen: " + email));
        return createCart(user);
    }

    private Cart createCart(AppUser user) {
        Cart c = Cart.builder().user(user).lastChanged(OffsetDateTime.now()).build();
        return carts.save(c);
    }

    private CartDto mapCart(Cart cart) {
        List<Ticket> items = tickets.findAllByCartId(cart.getId());

        int count = items.size();
        BigDecimal total = items.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CartItemDto> dtoItems = items.stream().map(this::mapItem).toList();

        return CartDto.builder()
                .id(cart.getId())
                .lastChanged(cart.getLastChanged())
                .items(dtoItems)
                .itemsCount(count)
                .total(total)
                .build();
    }

    private CartItemDto mapItem(Ticket t) {
        Event e = t.getEvent();
        Venue v = e.getVenue();
        Seat s = t.getSeat();

        VenueShortDto venueDto = VenueShortDto.builder()
                .id(v.getId())
                .name(v.getName())
                .address(v.getAddress())
                .build();

        return CartItemDto.builder()
                .ticketId(t.getId())
                .eventId(e.getId())
                .eventName(e.getName())
                .eventStartTime(e.getStartTime())
                .venue(venueDto)
                .seatId(s == null ? null : s.getId())
                .seatRow(s == null ? null : s.getSeatRow())
                .seatNumber(s == null ? null : s.getSeatNumber())
                .price(t.getPrice())
                .status(t.getStatus())
                .build();
    }

    @Transactional
    public CartDto clear(String email) {
        Cart cart = carts.findByUserEmail(email)
                .orElseGet(() -> createCartFor(email));

        List<Ticket> items = tickets.findAllByCartId(cart.getId());

        for (Ticket t : items) {
            t.setCart(null);
            if (t.getStatus() == TicketStatus.RESERVED) {
                // TODO ?
                t.setStatus(TicketStatus.CANCELLED);
            }
        }
        tickets.saveAll(items);

        cart.setLastChanged(OffsetDateTime.now());
        carts.save(cart);

        return mapCart(cart);
    }
}