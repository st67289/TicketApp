package cz.upce.fei.TicketApp.dto.event;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
public class EventFilter {
    private Long venueId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime to;

    private String q;
    private BigDecimal priceMax;

    private Boolean hasStanding;
    private Boolean hasSeating;
}

