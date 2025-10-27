package cz.upce.fei.TicketApp.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "venues")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_id")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "standing_capacity")
    private Integer standingCapacity;

    @Column(name = "sitting_capacity")
    private Integer sittingCapacity;

    @Column(name = "seating_plan_json", columnDefinition = "text")
    private String seatingPlanJson;

    // ** RELATIONS **

    @OneToMany(mappedBy = "venue", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<Event> events;

    @OneToMany(mappedBy = "venue", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<Seat> seats;
}
