package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.dto.cart.CartDto;
import cz.upce.fei.TicketApp.dto.cart.CartItemDto;
import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import cz.upce.fei.TicketApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
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
    private final RedissonClient redisson;

    // ====== READ ======
    @Transactional(readOnly = true)
    public CartDto getMyCart(String email) {
        Cart cart = carts.findByUserEmail(email)
                .orElseGet(() -> createCartFor(email)); // lazy create i při čtení je OK
        return mapCart(cart);
    }

    // ====== ADD ======
    public CartDto addItem(String email, CartAddItemDto dto) {
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen: " + email));

        Cart cart = carts.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        Event event = events.findById(dto.getEventId())
                .orElseThrow(() -> new EntityNotFoundException("Event nenalezen: " + dto.getEventId()));

        // Přepínač podle typu
        if (dto.getType() == TicketType.SEATING) {
            return addSeating(email, cart, event, dto.getSeatId());
        } else {
            int qty = dto.getQuantity() == null ? 1 : dto.getQuantity();
            return addStanding(cart, event, qty);
        }
    }

    // ====== REMOVE ======
    public CartDto removeItem(String email, Long ticketId) {
        Ticket t = tickets.findByIdAndCartUserEmail(ticketId, email)
                .orElseThrow(() -> new IllegalArgumentException("Položka košíku nenalezena"));

        // volitelně můžeš jen zrušit:
        // t.setStatus(TicketStatus.CANCELLED);
        // tickets.save(t);
        // nebo smazat (košík obvykle stačí smazat)
        tickets.delete(t);

        // refresh košíku
        Cart cart = carts.findByUserEmail(email)
                .orElseThrow();
        return mapCart(cart);
    }


    private CartDto addSeating(String email, Cart cart, Event event, Long seatId) {
        if (event.getSeatingPrice() == null) {
            throw new IllegalArgumentException("Event nemá cenu pro sezení.");
        }
        // validace sedadla
        Seat seat = seats.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("Seat nenalezen: " + seatId));
        if (!seat.getVenue().getId().equals(event.getVenue().getId())) {
            throw new IllegalArgumentException("Sedadlo nepatří do venue tohoto eventu.");
        }

        String lockKey = "lock:seat:" + event.getId() + ":" + seat.getId();
        RLock lock = redisson.getLock(lockKey);
        lock.lock();
        try {
            // kolize (rezervované/zakoupené)
            boolean taken = tickets.existsByEventIdAndSeatIdAndStatusIn(
                    event.getId(),
                    seat.getId(),
                    List.of(TicketStatus.RESERVED, TicketStatus.ISSUED, TicketStatus.USED)
            );
            if (taken) {
                throw new IllegalStateException("Sedadlo je již rezervované nebo prodané.");
            }

            // vytvoř tiket
            Ticket t = Ticket.builder()
                    .event(event)
                    .seat(seat)
                    .ticketType(TicketType.SEATING)
                    .cart(cart)
                    .order(null)
                    .ticketCode(genCode(event.getId()))
                    .price(event.getSeatingPrice())
                    .status(TicketStatus.RESERVED)
                    .build();
            tickets.save(t);

            // aktuální košík
            Cart reloaded = carts.findByUserEmail(email).orElseThrow();
            return mapCart(reloaded);
        } finally {
            lock.unlock();
        }
    }

    private CartDto addStanding(Cart cart, Event event, int qty) {
        if (event.getStandingPrice() == null) {
            throw new IllegalArgumentException("Event nemá cenu pro stání.");
        }
        Integer venueCap = event.getVenue().getStandingCapacity();
        int cap = venueCap == null ? 0 : venueCap;
        if (cap <= 0) {
            throw new IllegalArgumentException("Event/venue nemá kapacitu pro stání.");
        }

        long alreadyHeld = tickets.countByEventIdAndTicketTypeAndStatusIn(
                event.getId(),
                TicketType.STANDING,
                List.of(TicketStatus.RESERVED, TicketStatus.ISSUED, TicketStatus.USED)
        );

        if (alreadyHeld + qty > cap) {
            throw new IllegalStateException("Nedostatečná kapacita pro stání.");
        }

        BigDecimal price = event.getStandingPrice();
        for (int i = 0; i < qty; i++) {
            Ticket t = Ticket.builder()
                    .event(event)
                    .seat(null)
                    .ticketType(TicketType.STANDING)
                    .cart(cart)
                    .order(null)
                    .ticketCode(genCode(event.getId()))
                    .price(price)
                    .status(TicketStatus.RESERVED)
                    .build();
            tickets.save(t);
        }

        Cart reloaded = carts.findById(cart.getId()).orElseThrow();
        return mapCart(reloaded);
    }

    private String genCode(Long eventId) {
        return "E" + eventId + "-" + System.nanoTime();
    }

    private Cart createCartFor(String email) {
        AppUser user = users.findByEmail(email)
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
                .ticketType(t.getTicketType())
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
