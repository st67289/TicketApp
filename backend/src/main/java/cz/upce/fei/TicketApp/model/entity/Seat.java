package cz.upce.fei.TicketApp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(
        name = "seats",
        indexes = {
                @Index(name = "ix_seats_venue", columnList = "venue_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "ux_seat_venue_row_number", columnNames = {"venue_id", "seat_row", "seat_number"})
        }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Venue venue;

    @Column(name = "seat_row")
    private String seatRow;

    @Column(name = "seat_number")
    private String seatNumber;

    @Column(name = "seat_type")
    private String seatType;

    @OneToMany(mappedBy = "seat", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<Ticket> tickets;
}
