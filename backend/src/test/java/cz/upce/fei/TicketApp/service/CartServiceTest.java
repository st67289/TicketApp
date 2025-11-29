package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.dto.cart.CartDto;
import cz.upce.fei.TicketApp.exception.CapacityExceededException;
import cz.upce.fei.TicketApp.exception.SeatAlreadyTakenException;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// @ExtendWith nahrazuje nutnost volat openMocks v setupu, ale tvůj setup je taky OK.
// Pro jistotu necháme čisté MockitoAnnotations v setupu, pokud nepoužíváš JUnit 5 extension.
class CartServiceTest {

    @Mock UserRepository users;
    @Mock EventRepository events;
    @Mock SeatRepository seats;
    @Mock TicketRepository tickets;
    @Mock CartRepository carts;

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

        cart = Cart.builder()
                .id(5L)
                .user(user)
                .lastChanged(OffsetDateTime.now())
                .tickets(new ArrayList<>()) // Inicializace listu, aby nepadalo NPE
                .build();

        seat = Seat.builder()
                .id(123L)
                .seatNumber("5")
                .seatRow("A")
                .venue(venue)
                .build();
    }

    // --- TESTY NA STÁNÍ ---

    @Test
    void addItem_standing_success() {
        // 1. Mockování uživatele
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));

        // 2. Mockování košíku
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));

        // 3. Mockování eventu (pro stání se používá zamykací metoda)
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(event));

        // 4. Mockování kapacity
        when(tickets.countByEventIdAndStatusIn(any(), any())).thenReturn(0L);

        // 5. Mockování reloadu košíku
        when(carts.findById(5L)).thenReturn(Optional.of(cart));

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .quantity(1)
                .build();

        CartDto result = service.addItem("a@a.com", dto);

        // U stání se nyní používá saveAll (batch)
        verify(tickets).saveAll(anyList());
    }

    @Test
    void standing_raceCondition_simulation() {
        // 1. Specifické objekty pro tento test (aby se nepletla kapacita z setup)
        Venue smallVenue = Venue.builder().id(99L).standingCapacity(10).build();
        Event smallEvent = Event.builder().id(50L).venue(smallVenue).standingPrice(BigDecimal.ONE).build();

        // 2. Mocking
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(smallEvent));
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(smallEvent));

        // 3. Simulace: 6 lístků už je pryč (10 - 6 = 4 volné)
        when(tickets.countByEventIdAndStatusIn(any(), any())).thenReturn(6L);

        // 4. Chceme 7 lístků -> Mělo by selhat
        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .quantity(7)
                .build();

        // 5. Assert Exception
        CapacityExceededException ex = assertThrows(CapacityExceededException.class, () ->
                service.addItem("a@a.com", dto));

        // OPRAVA: Kontrolujeme jen text, který tvá servisa skutečně vrací
        assertTrue(ex.getMessage().contains("Nedostatečná kapacita pro stání"),
                "Chybná zpráva výjimky: " + ex.getMessage());

        verify(tickets, never()).saveAll(anyList());
    }

    @Test
    void standing_noPrice_throws() {
        event.setStandingPrice(null);

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).quantity(1).build()));
    }

    // --- TESTY NA SEZENÍ (Upraveno pro Batch / List<Long>) ---

    @Test
    void addItem_seating_success() {
        // Mockování
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        // Mockujeme batch metody repository
        when(seats.findAllById(List.of(123L))).thenReturn(List.of(seat));
        when(tickets.findAllByEventIdAndSeatIdIn(eq(50L), any())).thenReturn(new ArrayList<>()); // Žádné existující tickety

        // DTO nyní používá seatIds (List)
        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .seatIds(List.of(123L))
                .build();

        service.addItem("a@a.com", dto);

        // --- DŮLEŽITÉ: Ověřujeme saveAll, protože service používá batch ---
        verify(tickets).saveAll(anyList());
    }

    @Test
    void seating_taken_throws() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        when(seats.findAllById(List.of(123L))).thenReturn(List.of(seat));

        // Simulujeme, že lístek UŽ EXISTUJE (a není cancelled)
        Ticket existingTicket = Ticket.builder()
                .seat(seat)
                .event(event)
                .status(TicketStatus.RESERVED)
                .build();

        // Service si nejdřív načte existující tickety
        when(tickets.findAllByEventIdAndSeatIdIn(eq(50L), any())).thenReturn(List.of(existingTicket));

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .seatIds(List.of(123L))
                .build();

        assertThrows(SeatAlreadyTakenException.class, () ->
                service.addItem("a@a.com", dto));

        // Nemělo by dojít k uložení
        verify(tickets, never()).saveAll(anyList());
    }

    // --- OSTATNÍ VALIDACE ---

    @Test
    void addItem_userNotFound_throws() {
        when(users.findByEmailIgnoreCase("x@x.com")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.addItem("x@x.com",
                        CartAddItemDto.builder().eventId(1L).build()));
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