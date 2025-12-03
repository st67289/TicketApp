package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.order.OrderDto;
import cz.upce.fei.TicketApp.dto.order.OrderItemDto;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.*;
import cz.upce.fei.TicketApp.service.passwordReset.EmailService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final PdfService pdfService;
    private final EmailService emailService;

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

        // --- 8. ODESLÁNÍ EMAILU ---
        // Vygenerujeme PDF pro každý lístek
        try {
            Map<String, byte[]> attachments = new HashMap<>();

            for (Ticket t : cartTickets) {
                byte[] pdfBytes = pdfService.generateTicketPdf(t);
                String filename = "vstupenka_" + t.getId() + ".pdf";
                attachments.put(filename, pdfBytes);
            }

            // Text emailu
            String subject = "Potvrzení objednávky #" + order.getId();
            String text = "Dobrý den,\n\nděkujeme za vaši objednávku.\n\n" +
                    "V příloze naleznete vaše vstupenky ve formátu PDF.\n" +
                    "Celková cena: " + total + " Kč.\n\n" +
                    "Přejeme příjemnou zábavu!\nTicketApp Tým";

            // Odeslání (pokud je @Async, neblokuje transakci)
            emailService.sendTickets(userEmail, subject, text, attachments);

        } catch (Exception e) {
            // Logujeme chybu, ale nevyhazujeme výjimku, aby se nezrušila objednávka!
            // Uživatel si lístky může stáhnout i z webu.
            System.err.println("Nepodařilo se odeslat email se vstupenkami: " + e.getMessage());
        }

        return order.getId();
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(String email) {
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel nenalezen"));

        return orderRepository.findAllByAppUserId(user.getId()).stream()
                // Seřadíme od nejnovější
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    private OrderDto toOrderDto(Order order) {
        List<OrderItemDto> items = order.getTickets().stream()
                .map(t -> OrderItemDto.builder()
                        .eventName(t.getEvent().getName())
                        .venueName(t.getEvent().getVenue().getName())
                        .price(t.getPrice())
                        .type(t.getSeat() == null
                                ? "Na stání"
                                : String.format("Řada %s, Místo %s", t.getSeat().getSeatRow(), t.getSeat().getSeatNumber()))
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .totalPrice(order.getTotalPrice())
                .status(order.getPaymentStatus())
                .ticketCount(items.size())
                .items(items)
                .build();
    }
}