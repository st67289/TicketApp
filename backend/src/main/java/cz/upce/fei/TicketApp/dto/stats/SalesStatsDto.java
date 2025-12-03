package cz.upce.fei.TicketApp.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @AllArgsConstructor @NoArgsConstructor
public class SalesStatsDto {
    private LocalDate date;
    private long seatingCount;
    private long standingCount;
}