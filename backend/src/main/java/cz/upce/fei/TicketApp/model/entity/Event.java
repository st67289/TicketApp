package cz.upce.fei.TicketApp.model.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * EVENTS
 */
@Entity
@Table(name = "events")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Event {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @Column(nullable = false)
    private String title;


    @Column(columnDefinition = "text")
    private String description;


    @Column(name = "hall_id", nullable = false)
    private UUID hallId;


    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;


    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;


    @Column(columnDefinition = "text")
    private String seating;


    @Column(name = "standing_capacity")
    private Integer standingCapacity;


    @Column(name = "standing_sold")
    private Integer standingSold;


    @Column(name = "standing_price_cents")
    private Integer standingPriceCents;


    @Column(length = 3, columnDefinition = "char(3)")
    private String currency;


    @Column(nullable = false)
    private boolean published;
}
