package cz.upce.fei.TicketApp.dto.event;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventDetailDto {
    private Long id;
    private String name;
    private String description;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private VenueShortDto venue;

    private boolean hasStanding;
    private boolean hasSeating;

    private Integer standingCapacity;   // finální hodnota po uplatnění override
    private Integer sittingCapacity;

    private BigDecimal standingPrice;
    private BigDecimal seatingPrice;


    private Integer available;
    private Integer total;
}
