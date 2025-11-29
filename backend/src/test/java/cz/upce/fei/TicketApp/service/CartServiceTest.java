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
import org.mockito.*;

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
                .tickets(new ArrayList<>())
                .build();

        seat = Seat.builder()
                .id(123L)
                .seatNumber("5")
                .seatRow("A")
                .venue(venue)
                .build();
    }

    // --- TESTY NA STÁNÍ (s Pessimistic Lock logikou) ---

    @Test
    void addItem_standing_success() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        // Pro stání se volá findByIdWithLock!
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(event));

        // Simulace: Zatím nikdo lístky nemá
        when(tickets.countByEventIdAndStatusIn(any(), any())).thenReturn(0L);

        // Simulace reloadu košíku na konci
        when(carts.findById(5L)).thenReturn(Optional.of(cart));

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .quantity(1)
                .build();

        CartDto result = service.addItem("a@a.com", dto);

        assertEquals(0, result.getItemsCount());
        // Pozn: mockovaný cart.getTickets() je prázdný, pokud ho ručně nenaplníš v testu,
        // ale důležité je, že metoda prošla bez výjimky a zavolala save.
        verify(tickets, times(1)).save(any(Ticket.class));
    }

    @Test
    void standing_raceCondition_simulation() {
        // SCÉNÁŘ:
        // Kapacita je 10.
        // Někdo (jiné vlákno/transakce) už koupil 6 lístků (nebo je drží v košíku).
        // Já chci koupit 7 lístků.
        // 6 + 7 = 13 > 10 -> Musí vyhodit chybu.

        venue.setStandingCapacity(10); // Kapacita 10

        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));

        // Zámek získáme (v Unit testu vždy, v reálu by se čekalo)
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(event));

        // TOTO JE KLÍČOVÉ: Simulujeme, že v DB už je 6 zabraných lístků
        when(tickets.countByEventIdAndStatusIn(any(), any())).thenReturn(6L);

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .quantity(7) // Chci 7
                .build();

        // Očekáváme námi vytvořenou CapacityExceededException
        CapacityExceededException ex = assertThrows(CapacityExceededException.class, () ->
                service.addItem("a@a.com", dto));

        assertTrue(ex.getMessage().contains("Zbývá: 4")); // 10 - 6 = 4 volné
        verify(tickets, never()).save(any(Ticket.class)); // Nic se neuložilo
    }

    @Test
    void standing_noPrice_throws() {
        // Nutné mockovat findByIdWithLock, protože tam se to kontroluje
        event.setStandingPrice(null);
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(events.findByIdWithLock(50L)).thenReturn(Optional.of(event));

        assertThrows(IllegalArgumentException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).quantity(1).build()));
    }

    // --- TESTY NA SEZENÍ ---

    @Test
    void addItem_seating_success() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.of(seat));

        when(carts.save(any(Cart.class))).thenReturn(cart);

        CartAddItemDto dto = CartAddItemDto.builder()
                .eventId(50L)
                .seatId(123L)
                .build();

        CartDto result = service.addItem("a@a.com", dto);

        // Ověříme, že se volal save ticketu
        verify(tickets).save(any(Ticket.class));
    }

    @Test
    void seating_taken_throws() {
        when(users.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(user));
        when(carts.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(events.findById(50L)).thenReturn(Optional.of(event));
        when(seats.findById(123L)).thenReturn(Optional.of(seat));

        // Simulujeme chybu DB constraintu
        doThrow(new org.springframework.dao.DataIntegrityViolationException("Constraint violation"))
                .when(tickets).save(any(Ticket.class));

        assertThrows(SeatAlreadyTakenException.class, () ->
                service.addItem("a@a.com",
                        CartAddItemDto.builder().eventId(50L).seatId(123L).build()));
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

        // Simulace reloadu prázdného košíku
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

        // Po smazání
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