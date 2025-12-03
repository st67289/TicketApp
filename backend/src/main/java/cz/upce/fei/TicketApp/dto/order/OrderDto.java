package cz.upce.fei.TicketApp.dto.order;

import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDto {
    private Long id;
    private OffsetDateTime createdAt;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private int ticketCount;

    // Zkrácený seznam vstupenek pro přehled (volitelné, nebo jen počet)
    private List<OrderItemDto> items;
}