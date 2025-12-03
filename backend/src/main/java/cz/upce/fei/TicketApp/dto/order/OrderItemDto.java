package cz.upce.fei.TicketApp.dto.order;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderItemDto {
    private String eventName;
    private String venueName;
    private BigDecimal price;
    private String type; // "Stání" nebo "Řada A, Sedadlo 12"
}