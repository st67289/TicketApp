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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
                .orElseGet(() -> createCartFor(email));
        return mapCart(cart);
    }

    public CartDto addItem(String email, CartAddItemDto dto) {
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen: " + email));

        Cart cart = carts.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        Event event = events.findById(dto.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event nenalezen: " + dto.getEventId()));

        if (dto.getSeatIds() != null && !dto.getSeatIds().isEmpty()) {
            return addSeatingBatch(cart, event, dto.getSeatIds());
        } else {
            int qty = dto.getQuantity() == null ? 1 : dto.getQuantity();
            if (qty <= 0) {
                throw new IllegalArgumentException("Množství musí být kladné.");
            }
            return addStanding(cart, event, qty);
        }
    }

    private CartDto addSeatingBatch(Cart cart, Event event, List<Long> seatIds) {
        List<Seat> seatsList = seats.findAllById(seatIds);
        if (seatsList.size() != seatIds.size()) {
            throw new EntityNotFoundException("Některá zadaná sedadla neexistují.");
        }

        List<Ticket> existingTickets = tickets.findAllByEventIdAndSeatIdIn(event.getId(), seatIds);

        List<Ticket> toSave = new ArrayList<>();

        for (Seat seat : seatsList) {
            Ticket existing = existingTickets.stream()
                    .filter(t -> t.getSeat().getId().equals(seat.getId()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                if (existing.getStatus() != TicketStatus.CANCELLED) {
                    if (existing.getCart() == null || !existing.getCart().getId().equals(cart.getId())) {
                        throw new SeatAlreadyTakenException("Sedadlo " + seat.getSeatNumber() + " je již obsazeno.");
                    }
                } else {
                    existing.setStatus(TicketStatus.RESERVED);
                    existing.setCart(cart);
                    existing.setPrice(event.getSeatingPrice());
                    existing.setTicketCode(genCode(event.getId()));
                    toSave.add(existing);
                }
            } else {
                Ticket newTicket = Ticket.builder()
                        .event(event)
                        .seat(seat)
                        .cart(cart)
                        .ticketCode(genCode(event.getId()))
                        .price(event.getSeatingPrice())
                        .status(TicketStatus.RESERVED)
                        .build();
                toSave.add(newTicket);
            }
        }

        if (!toSave.isEmpty()) {
            tickets.saveAll(toSave);
            tickets.flush();
        }

        return mapCart(cart);
    }

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

        if (cap - alreadyHeld < qty) {
            throw new CapacityExceededException("Nedostatečná kapacita pro stání.");
        }

        BigDecimal price = lockedEvent.getStandingPrice();
        List<Ticket> standingTickets = new ArrayList<>();

        for (int i = 0; i < qty; i++) {
            Ticket t = Ticket.builder()
                    .event(lockedEvent)
                    .seat(null)
                    .cart(cart)
                    .ticketCode(genCode(lockedEvent.getId()))
                    .price(price)
                    .status(TicketStatus.RESERVED)
                    .build();
            standingTickets.add(t);
        }
        tickets.saveAll(standingTickets);

        return mapCart(cart);
    }

    private String genCode(Long eventId) {
        String code;

        do {
            String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            code = "E" + eventId + "-" + randomPart;

        } while (tickets.existsByTicketCode(code));

        return code;
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

    public CartDto removeItem(String email, Long ticketId) {
        Ticket t = tickets.findByIdAndCartUserEmail(ticketId, email)
                .orElseThrow(() -> new IllegalArgumentException("Položka košíku nenalezena"));
        tickets.delete(t);
        Cart cart = carts.findByUserEmail(email).orElseThrow();
        return mapCart(cart);
    }

    @Transactional
    public CartDto clear(String email) {
        Cart cart = carts.findByUserEmail(email).orElseGet(() -> createCartFor(email));
        List<Ticket> items = tickets.findAllByCartId(cart.getId());
        for (Ticket t : items) {
            t.setCart(null);
            if (t.getStatus() == TicketStatus.RESERVED) {
                t.setStatus(TicketStatus.CANCELLED);
            }
        }
        tickets.saveAll(items);
        return mapCart(cart);
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
                .id(v.getId()).name(v.getName()).address(v.getAddress()).build();
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
}