package cz.upce.fei.TicketApp.dto.cart;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CartDto {
    private Long id;
    private OffsetDateTime lastChanged;
    private List<CartItemDto> items;

    private Integer itemsCount;   // sum(items)
    private BigDecimal total;     // sum(item.price)
}