package cz.upce.fei.TicketApp.model.entity;
import cz.upce.fei.TicketApp.model.enums.ItemKind;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * ORDER_ITEMS
 */
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "ix_order_items_order", columnList = "order_id"),
        @Index(name = "ix_order_items_event", columnList = "event_id"),
        @Index(name = "ix_order_items_seat", columnList = "seat_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderItem {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_items_order"))
    private Order order;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_items_event"))
    private Event event;


    @Enumerated(EnumType.STRING)
    @Column(name = "item_kind", nullable = false, length = 16)
    private ItemKind itemKind; // SEAT or STANDING


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", foreignKey = @ForeignKey(name = "fk_order_items_seat"))
    private Seat seat; // nullable for standing


    @Column(nullable = false)
    private Integer quantity;


    @Column(name = "unit_price_cents", nullable = false)
    private Integer unitPriceCents;


    @Column(length = 3, columnDefinition = "char(3)")
    private String currency;
}