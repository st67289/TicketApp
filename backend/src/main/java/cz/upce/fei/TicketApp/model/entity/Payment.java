package cz.upce.fei.TicketApp.model.entity;
import cz.upce.fei.TicketApp.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * PAYMENTS
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "ix_payments_order", columnList = "order_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Payment {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payments_order"))
    private Order order;


    @Column(nullable = false)
    private String provider;


    @Column(name = "provider_txn_id")
    private String providerTxnId;


    @Column(name = "amount_cents", nullable = false)
    private Integer amountCents;


    @Column(length = 3, columnDefinition = "char(3)")
    private String currency;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PaymentStatus status;


    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}