package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.order.OrderDto;
import cz.upce.fei.TicketApp.dto.order.OrderItemDto;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.CartRepository;
import cz.upce.fei.TicketApp.repository.OrderRepository;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.service.passwordReset.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PdfService pdfService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private OrderService orderService;

    // ==========================================
    // CREATE ORDER TESTS
    // ==========================================

    @Test
    void createOrder_Success_ShouldCreateOrderAndSendEmail() {
        String email = "buyer@example.com";
        AppUser user = AppUser.builder().id(1L).email(email).build();
        Cart cart = Cart.builder().id(10L).user(user).build();

        Ticket ticket1 = new Ticket();
        ticket1.setId(101L);
        ticket1.setPrice(BigDecimal.valueOf(500));
        ticket1.setCart(cart);
        ticket1.setStatus(TicketStatus.RESERVED);

        Ticket ticket2 = new Ticket();
        ticket2.setId(102L);
        ticket2.setPrice(BigDecimal.valueOf(300));
        ticket2.setCart(cart);

        List<Ticket> tickets = List.of(ticket1, ticket2);

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(ticketRepository.findAllByCartId(10L)).thenReturn(tickets);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(555L);
            return o;
        });

        when(pdfService.generateTicketPdf(any(Ticket.class))).thenReturn(new byte[]{1, 2, 3});

        Long orderId = orderService.createOrder(email);

        assertEquals(555L, orderId);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        assertEquals(user, savedOrder.getAppUser());
        assertEquals(OrderStatus.PAID, savedOrder.getPaymentStatus());
        assertEquals(BigDecimal.valueOf(800), savedOrder.getTotalPrice());

        assertEquals(TicketStatus.ISSUED, ticket1.getStatus());
        assertEquals(savedOrder, ticket1.getOrder());
        assertNull(ticket1.getCart());

        verify(ticketRepository).saveAll(tickets);

        verify(cartRepository).save(cart);

        verify(pdfService, times(2)).generateTicketPdf(any());
        verify(emailService).sendTickets(eq(email), contains("555"), anyString(), anyMap());
    }

    @Test
    void createOrder_EmptyCart_ThrowsException() {
        String email = "empty@example.com";
        AppUser user = AppUser.builder().id(1L).build();
        Cart cart = Cart.builder().id(10L).build();

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(ticketRepository.findAllByCartId(10L)).thenReturn(Collections.emptyList());

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.createOrder(email));

        assertEquals("Košík je prázdný.", ex.getMessage());

        verify(orderRepository, never()).save(any());
    }

    @Test
    void createOrder_EmailFailure_ShouldNotRollbackOrder() {
        String email = "fail@example.com";
        AppUser user = AppUser.builder().id(1L).email(email).build();
        Cart cart = Cart.builder().id(10L).build();
        Ticket ticket = new Ticket();
        ticket.setPrice(BigDecimal.TEN);

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(ticketRepository.findAllByCartId(10L)).thenReturn(List.of(ticket));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(999L);
            return o;
        });

        when(pdfService.generateTicketPdf(any())).thenThrow(new RuntimeException("PDF Error"));

        Long orderId = orderService.createOrder(email);

        assertEquals(999L, orderId);
        verify(orderRepository).save(any(Order.class));
        verify(ticketRepository).saveAll(anyList());
    }

    @Test
    void createOrder_UserNotFound_ThrowsException() {
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> orderService.createOrder("unknown"));
    }

    @Test
    void createOrder_CartNotFound_ThrowsException() {
        AppUser user = AppUser.builder().id(1L).build();
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> orderService.createOrder("user"));
    }

    // ==========================================
    // GET MY ORDERS TESTS
    // ==========================================

    @Test
    void getMyOrders_Success_MapsDtoCorrectly() {
        String email = "user@example.com";
        AppUser user = AppUser.builder().id(1L).email(email).build();

        Venue venue = new Venue();
        venue.setName("O2 Arena");

        Event event = new Event();
        event.setName("Koncert");
        event.setVenue(venue);

        Seat seat = new Seat();
        seat.setSeatRow("A");
        seat.setSeatNumber("1");

        Ticket t1 = new Ticket();
        t1.setPrice(BigDecimal.valueOf(100));
        t1.setEvent(event);
        t1.setSeat(seat);

        Ticket t2 = new Ticket();
        t2.setPrice(BigDecimal.valueOf(50));
        t2.setEvent(event);
        t2.setSeat(null);

        Order order = Order.builder()
                .id(123L)
                .createdAt(OffsetDateTime.now())
                .totalPrice(BigDecimal.valueOf(150))
                .paymentStatus(OrderStatus.PAID)
                .tickets(List.of(t1, t2))
                .build();

        Page<Order> orderPage = new PageImpl<>(List.of(order));

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(orderRepository.findAllByAppUserId(eq(1L), any(Pageable.class))).thenReturn(orderPage);

        Page<OrderDto> result = orderService.getMyOrders(email, Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        OrderDto dto = result.getContent().get(0);

        assertEquals(123L, dto.getId());
        assertEquals(BigDecimal.valueOf(150), dto.getTotalPrice());
        assertEquals(2, dto.getTicketCount());

        List<OrderItemDto> items = dto.getItems();
        assertEquals(2, items.size());

        OrderItemDto item1 = items.get(0);
        assertEquals("Koncert", item1.getEventName());
        assertEquals("Řada A, Místo 1", item1.getType());

        OrderItemDto item2 = items.get(1);
        assertEquals("Na stání", item2.getType());
    }

    @Test
    void getMyOrders_UserNotFound_ThrowsException() {
        when(userRepository.findByEmailIgnoreCase("ghost")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class,
                () -> orderService.getMyOrders("ghost", Pageable.unpaged()));
    }
}