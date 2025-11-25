package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Long createOrder(String userEmail) {
        // 1. Najdi uživatele
        AppUser user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen"));

        // 2. Najdi jeho košík
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Košík nenalezen nebo je prázdný"));

        // 3. Najdi tickety v košíku
        List<Ticket> cartTickets = ticketRepository.findAllByCartId(cart.getId());

        if (cartTickets.isEmpty()) {
            throw new IllegalStateException("Košík je prázdný.");
        }

        // 4. Spočítej cenu
        BigDecimal total = cartTickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Vytvoř objednávku (MOCK: rovnou PAID)
        Order order = Order.builder()
                .appUser(user)
                .createdAt(OffsetDateTime.now())
                .paymentStatus(OrderStatus.PAID)
                .totalPrice(total)
                .build();

        order = orderRepository.save(order);

        // 6. Uprav tickety (přesuň z Cart do Order)
        for (Ticket t : cartTickets) {
            t.setCart(null);                 // Odpojit od košíku
            t.setOrder(order);               // Připojit k objednávce
            t.setStatus(TicketStatus.ISSUED); // Nastavit stav na VYDÁNO
        }
        ticketRepository.saveAll(cartTickets);

        // 7. Aktualizuj košík
        cart.setLastChanged(OffsetDateTime.now());
        cartRepository.save(cart);

        return order.getId();
    }
}