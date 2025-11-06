package cz.upce.fei.TicketApp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(
        name = "carts",
        indexes = {
                @Index(name = "ix_cart_user", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "ux_cart_user", columnNames = "user_id")
        }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_cart_user"), unique = true)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private AppUser user;

    @UpdateTimestamp
    @Column(name = "last_changed", nullable = false)
    private OffsetDateTime lastChanged;

    @OneToMany(mappedBy = "cart", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<Ticket> tickets;
}
