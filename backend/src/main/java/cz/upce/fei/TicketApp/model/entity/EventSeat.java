package cz.upce.fei.TicketApp.model.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * EVENT_SEATS
 */
@Entity
@Table(name = "event_seats",
        uniqueConstraints = @UniqueConstraint(name = "ux_event_seats_event_seat", columnNames = {"event_id", "seat_id"}),
        indexes = {
                @Index(name = "ix_event_seats_event", columnList = "event_id"),
                @Index(name = "ix_event_seats_seat", columnList = "seat_id")
        })
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EventSeat {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, foreignKey = @ForeignKey(name = "fk_event_seats_event"))
    private Event event;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false, foreignKey = @ForeignKey(name = "fk_event_seats_seat"))
    private Seat seat;


    @Column(name = "price_cents", nullable = false)
    private Integer priceCents;


    @Column(length = 3, columnDefinition = "char(3)")
    private String currency;


    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;
}