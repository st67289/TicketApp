package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.dashboard.UserDashboardDto;
import cz.upce.fei.TicketApp.dto.event.EventFilter;
import cz.upce.fei.TicketApp.dto.event.EventListDto;
import cz.upce.fei.TicketApp.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EventRepository eventRepository;
    private final EventService eventService; // Využijeme existující logiku mapování

    @Transactional(readOnly = true)
    public UserDashboardDto getUserDashboard() {
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Získat TOP 3 nejbližší akce
        // Použijeme EventService.list(), protože už má vyřešené mapování na DTO i počítání volných míst
        EventFilter filter = EventFilter.builder().from(now).build();
        Page<EventListDto> page = eventService.list(filter,
                PageRequest.of(0, 3, Sort.by("startTime").ascending()));

        List<EventListDto> topEvents = page.getContent();

        // 2. Celkový počet budoucích akcí
        long totalCount = eventRepository.countByStartTimeAfter(now);

        // 3. Nejnižší cena ("Od ... Kč")
        BigDecimal minPrice = eventRepository.findCheapestPriceInFuture(now);

        // Ošetření, kdyby DB vrátila null (žádné akce) nebo to naše velké číslo
        if (minPrice != null && minPrice.compareTo(new BigDecimal("9999999")) >= 0) {
            minPrice = null;
        }

        return UserDashboardDto.builder()
                .upcomingEvents(topEvents)
                .totalUpcomingCount(totalCount)
                .cheapestTicketPrice(minPrice)
                .build();
    }
}