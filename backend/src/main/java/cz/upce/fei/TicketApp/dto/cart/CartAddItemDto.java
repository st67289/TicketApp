package cz.upce.fei.TicketApp.dto.cart;

import cz.upce.fei.TicketApp.model.enums.TicketType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartAddItemDto {

    @NotNull
    private Long eventId;

    // pro STANDING
    @Min(1)
    private Integer quantity;

    // pro SEATING
    private List<Long> seatIds;

}
