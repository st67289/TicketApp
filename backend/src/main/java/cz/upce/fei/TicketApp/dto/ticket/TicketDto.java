package cz.upce.fei.TicketApp.dto.ticket;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketDto {
    private Long id;
    private String ticketCode;
    private BigDecimal price;
    private TicketType type;
    private TicketStatus status;

    private String eventName;
    private OffsetDateTime eventStart;
    private VenueShortDto venue;

    // Pro sezení
    private String seatRow;
    private String seatNumber;
}