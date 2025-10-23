package cz.upce.fei.TicketApp.model.entity;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * ORDERS
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "ix_orders_user", columnList = "user_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orders_user"))
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OrderStatus status;


    @Column(name = "total_cents", nullable = false)
    private Integer totalCents;


    @Column(length = 3, columnDefinition = "char(3)")
    private String currency; // ISO 4217


    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;


    @Column(name = "paid_at")
    private OffsetDateTime paidAt;
}
