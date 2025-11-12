package cz.upce.fei.TicketApp.dto.cart;

import cz.upce.fei.TicketApp.model.enums.TicketType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartAddItemDto {

    @NotNull
    private TicketType type;   // STANDING nebo SEATING

    @NotNull
    private Long eventId;

    // pro STANDING
    @Min(1)
    private Integer quantity;

    // pro SEATING
    @Positive
    private Long seatId;

    @AssertTrue(message = "quantity musí být >=1 pro STANDING")
    public boolean isStandingQtyValid() {
        if (type == TicketType.STANDING) {
            return quantity == null || quantity >= 1;
        }
        return true;
    }

    @AssertTrue(message = "seatId je povinné pro SEATING")
    public boolean isSeatingSeatValid() {
        if (type == TicketType.SEATING) {
            return seatId != null && seatId > 0;
        }
        return true;
    }


}
