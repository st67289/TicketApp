package cz.upce.fei.TicketApp.dto.cart;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemDto {
    private Long ticketId;

    // Event info
    private Long eventId;
    private String eventName;
    private OffsetDateTime eventStartTime;
    private VenueShortDto venue;

    private Long seatId;        // null pro STANDING
    private String seatRow;     // null pro STANDING
    private String seatNumber;  // null pro STANDING

    // Cena a stav
    private BigDecimal price;
    private TicketStatus status;
}
