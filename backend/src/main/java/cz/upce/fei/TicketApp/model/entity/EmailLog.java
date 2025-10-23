package cz.upce.fei.TicketApp.model.entity;
import cz.upce.fei.TicketApp.model.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;
import java.util.UUID;
/**
 * EMAIL_LOG
 */
@Entity
@Table(name = "email_log", indexes = {
        @Index(name = "ix_email_log_user", columnList = "user_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EmailLog {
    @Id
    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_email_log_user"))
    private User user; // nullable if email not tied to a user


    @Column(name = "to_email", columnDefinition = "text", nullable = false)
    private String toEmail;


    @Column(nullable = false)
    private String subject;


    @Column(columnDefinition = "text")
    private String body;


    @Column(name = "sent_at")
    private OffsetDateTime sentAt;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EmailStatus status;


    @Column(columnDefinition = "text")
    private String error;
}