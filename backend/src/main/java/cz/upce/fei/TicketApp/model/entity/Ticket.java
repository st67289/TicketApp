package cz.upce.fei.TicketApp.model.entity;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * TICKETS
 */
@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "ix_tickets_user", columnList = "user_id"),
        @Index(name = "ix_tickets_event", columnList = "event_id"),
        @Index(name = "ix_tickets_seat", columnList = "seat_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Ticket {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tickets_user"))
    private User user;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tickets_event"))
    private Event event;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", foreignKey = @ForeignKey(name = "fk_tickets_seat"))
    private Seat seat;


    @Column(name = "ticket_code")
    private String ticketCode;


    @Column(name = "qr_payload", columnDefinition = "text")
    private String qrPayload;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TicketStatus status;


    @Column(name = "issued_at")
    private OffsetDateTime issuedAt;
}