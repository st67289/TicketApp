package cz.upce.fei.TicketApp.model.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * RESERVATIONS
 */
@Entity
@Table(name = "reservations", indexes = {
        @Index(name = "ix_reservations_user", columnList = "user_id"),
        @Index(name = "ix_reservations_event", columnList = "event_id"),
        @Index(name = "ix_reservations_seat", columnList = "seat_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Reservation {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reservations_user"))
    private User user;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reservations_event"))
    private Event event;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", foreignKey = @ForeignKey(name = "fk_reservations_seat"))
    private Seat seat;


    @Column(name = "standing_qty")
    private Integer standingQty;


    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;


    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;


    @Column(nullable = false)
    private boolean active;
}