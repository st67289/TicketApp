package cz.upce.fei.TicketApp.dto.dashboard;

import cz.upce.fei.TicketApp.dto.event.EventListDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDashboardDto {
    private List<EventListDto> upcomingEvents;
    private long totalUpcomingCount;
    private BigDecimal cheapestTicketPrice;
}