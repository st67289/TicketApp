package cz.upce.fei.TicketApp.model.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * SEATS
 */
@Entity
@Table(name = "seats", indexes = {
        @Index(name = "ix_seats_hall", columnList = "hall_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Seat {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @Column(name = "hall_id", nullable = false)
    private UUID hallId; // external hall reference


    private String section;


    @Column(name = "row_label")
    private String rowLabel;


    @Column(name = "seat_number")
    private String seatNumber;
}