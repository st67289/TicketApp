package cz.upce.fei.TicketApp.dto.event;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventListDto {
    private Long id;
    private String name;
    private OffsetDateTime startTime;
    private VenueShortDto venue;

    private boolean hasStanding;   // enableStanding && standingCapacity>0
    private boolean hasSeating;    // enableSeating  && sittingCapacity>0

    private BigDecimal fromPrice;
    private BigDecimal standingPrice;
    private BigDecimal seatingPrice;

    private Integer available;     // dopočítané
    private Integer total;         // dopočítané
}
