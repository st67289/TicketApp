package cz.upce.fei.TicketApp.dto.event;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventUpdateDto {
    private String name;

    @Size(max = 5000)
    private String description;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Long venueId;

    private Boolean enableStanding;
    private Boolean enableSeating;

    @Min(0)
    private Integer standingCapacityOverride;

    @Min(0)
    private Integer sittingCapacityOverride;

    @Min(0)
    private BigDecimal standingPrice;

    @Min(0)
    private BigDecimal seatingPrice;
}
