package cz.upce.fei.TicketApp.dto.event;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventCreateDto {

    @NotBlank
    private String name;

    @Size(max = 5000)
    private String description;

    @NotNull
    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    @NotNull
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
