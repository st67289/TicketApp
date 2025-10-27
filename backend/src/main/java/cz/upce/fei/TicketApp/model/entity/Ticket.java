package cz.upce.fei.TicketApp.model.entity;

import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "ix_ticket_event", columnList = "event_id"),
        @Index(name = "ix_ticket_seat", columnList = "seat_id"),
        @Index(name = "ux_ticket_code", columnList = "ticket_code", unique = true)
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Seat seat;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /*
    ??????
     */
    @Column(name = "ticket_type")
    private String ticketType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private TicketStatus status;

    // ** RELATIONS **

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<OrderItem> orderItems;
}
