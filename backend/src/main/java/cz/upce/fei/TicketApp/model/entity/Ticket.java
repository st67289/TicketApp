package cz.upce.fei.TicketApp.model.entity;

import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "ix_ticket_event", columnList = "event_id"),
        @Index(name = "ix_ticket_seat", columnList = "seat_id"),
        @Index(name = "ix_ticket_cart", columnList = "cart_id"),
        @Index(name = "ix_ticket_order", columnList = "order_id"),
        @Index(name = "ux_ticket_code", columnList = "ticket_code", unique = true)
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_ticket_event_seat", columnNames = {"event_id", "seat_id"})}
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Seat seat;

//    @Enumerated(EnumType.STRING)
//    @Column(name = "ticket_type", length = 16)
//    private TicketType ticketType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Order order;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private TicketStatus status;
}
