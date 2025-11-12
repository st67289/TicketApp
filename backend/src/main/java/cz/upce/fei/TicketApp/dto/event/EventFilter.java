package cz.upce.fei.TicketApp.dto.event;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventFilter {
    private String q;
    private Long venueId;

    private Boolean hasStanding;
    private Boolean hasSeating;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime to;

    private BigDecimal priceMax;
}
