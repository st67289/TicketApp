package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.dto.cart.CartDto;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import cz.upce.fei.TicketApp.repository.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import jakarta.persistence.EntityNotFoundException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CartServiceTest {

    @Mock UserRepository users;
    @Mock EventRepository events;
    @Mock SeatRepository seats;
    @Mock TicketRepository tickets;
    @Mock CartRepository carts;
    @Mock RedissonClient redisson;
    @Mock RLock lock;

    @InjectMocks CartService service;

    AppUser user;
    Cart cart;
    Event event;
    Venue venue;
    Seat seat;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        venue = Venue.builder().id(10L).name("Hall").standingCapacity(100).build();

        event = Event.builder()
                .id(50L)
                .name("Test Event")
                .venue(venue)
                .seatingPrice(BigDecimal.TEN)
                .standingPrice(BigDecimal.ONE)
                .build();

        user = AppUser.builder().id(1L).email("a@a.com").build();
        cart = Cart.builder().id(5L).user(user).lastChanged(OffsetDateTime.now()).build();

        seat = Seat.builder()
                .id(123L)
                .seatNumber("5")
                .seatRow("A")
                .venue(venue)
                .build();

        when(redisson.getLock(anyString())).thenReturn(lock);
    }

    @Test
    void addItem_standing_success() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(tickets.countByEventIdAndTicketTypeAndStatusIn(any(), any(), any())).thenReturn(0L);

        when(tickets.findAllByCartId(cart.getId())).thenReturn(
                List.of(Ticket.builder().id(99L).price(BigDecimal.ONE).event(event).ticketType(TicketType.STANDING).status(TicketStatus.RESERVED).build())
        );

        when(carts.findById(5L)).thenReturn(Optional.of(cart));

        CartAddItemDto dto = CartAddItemDto.builder()
                .type(TicketType.STANDING)
                .eventId(50L)
                .quantity(1)
                .build();

        CartDto result = service.addItem("a@a.com", dto);

        assertEquals(1, result.getItemsCount());
    }

    @Test
    void addItem_seating_success() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.of(seat));

        when(tickets.existsByEventIdAndSeatIdAndStatusIn(any(), any(), any())).thenReturn(false);
        when(tickets.findAllByCartId(5L)).thenReturn(List.of(
                Ticket.builder().id(200L).seat(seat).price(BigDecimal.TEN).event(event).ticketType(TicketType.SEATING).status(TicketStatus.RESERVED).build()
        ));

        when(carts.findByUserEmail("a@a.com")).thenReturn(Optional.of(cart));

        CartAddItemDto dto = CartAddItemDto.builder()
                .type(TicketType.SEATING)
                .eventId(50L)
                .seatId(123L)
                .build();

        CartDto result = service.addItem("a@a.com", dto);

        assertEquals(1, result.getItemsCount());
    }

    @Test
    void addItem_userNotFound_throws() {
        when(users.findByEmailIgnoreCase("x@x.com")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.addItem("x@x.com",
                        CartAddItemDto.builder().eventId(1L).type(TicketType.STANDING).build()));
    }

    @Test
    void addItem_eventNotFound_throws() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(999L).type(TicketType.STANDING).build()));
    }

    @Test
    void seating_noPrice_throws() {
        event.setSeatingPrice(null);

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L).seatId(123L).type(TicketType.SEATING).build();

        assertThrows(IllegalArgumentException.class, () -> service.addItem("a@a.com", dto));
    }

    @Test
    void seating_seatNotFound_throws() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).seatId(123L).type(TicketType.SEATING).build()));
    }

    @Test
    void seating_wrongVenue_throws() {
        Seat wrong = Seat.builder().id(123L).venue(Venue.builder().id(999L).build()).build();

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.of(wrong));

        assertThrows(IllegalArgumentException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).seatId(123L).type(TicketType.SEATING).build()));
    }

    @Test
    void seating_taken_throws() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.of(seat));

        when(tickets.existsByEventIdAndSeatIdAndStatusIn(any(), any(), any())).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).seatId(123L).type(TicketType.SEATING).build()));
    }

    @Test
    void standing_noPrice_throws() {
        event.setStandingPrice(null);

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).quantity(1).type(TicketType.STANDING).build()));
    }

    @Test
    void standing_noCapacity_throws() {
        venue.setStandingCapacity(0);

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).quantity(1).type(TicketType.STANDING).build()));
    }

    @Test
    void standing_overCapacity_throws() {
        venue.setStandingCapacity(10);

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(tickets.countByEventIdAndTicketTypeAndStatusIn(any(), any(), any())).thenReturn(9L);

        assertThrows(IllegalStateException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).quantity(5).type(TicketType.STANDING).build()));
    }

    @Test
    void removeItem_success() {
        Ticket t = Ticket.builder().id(10L).cart(cart).status(TicketStatus.RESERVED).build();

        when(tickets.findByIdAndCartUserEmail(10L, "a@a.com")).thenReturn(Optional.of(t));
        when(carts.findByUserEmail("a@a.com")).thenReturn(Optional.of(cart));
        when(tickets.findAllByCartId(5L)).thenReturn(List.of());

        CartDto dto = service.removeItem("a@a.com", 10L);

        assertEquals(0, dto.getItemsCount());
        verify(tickets).delete(t);
    }

    @Test
    void removeItem_notFound_throws() {
        when(tickets.findByIdAndCartUserEmail(anyLong(), anyString())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.removeItem("a@a.com", 99L));
    }

    @Test
    void clear_success() {
        Ticket t = Ticket.builder()
                .id(1L)
                .cart(cart)
                .status(TicketStatus.RESERVED)
                .event(event)
                .price(BigDecimal.ONE)
                .build();

        when(carts.findByUserEmail("a@a.com")).thenReturn(Optional.of(cart));
        when(tickets.findAllByCartId(5L)).thenReturn(List.of(t));
        when(carts.save(cart)).thenReturn(cart);
        when(tickets.findAllByCartId(5L)).thenReturn(List.of());

        CartDto dto = service.clear("a@a.com");

        assertEquals(0, dto.getItemsCount());
    }

    @Test
    void getMyCart_createsCart() {
        when(carts.findByUserEmail("a@a.com")).thenReturn(Optional.empty());
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(tickets.findAllByCartId(any())).thenReturn(List.of());

        CartDto dto = service.getMyCart("a@a.com");

        assertEquals(0, dto.getItemsCount());
        verify(carts).save(any(Cart.class));
    }

}
