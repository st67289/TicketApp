package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.dashboard.UserDashboardDto;
import cz.upce.fei.TicketApp.dto.event.EventFilter;
import cz.upce.fei.TicketApp.dto.event.EventListDto;
import cz.upce.fei.TicketApp.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventService eventService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getUserDashboard_StandardScenario_ReturnsFullDto() {
        EventListDto event1 = new EventListDto();
        event1.setName("Koncert");

        Page<EventListDto> mockPage = new PageImpl<>(List.of(event1));

        when(eventService.list(any(EventFilter.class), any(Pageable.class)))
                .thenReturn(mockPage);

        when(eventRepository.countByStartTimeAfter(any(OffsetDateTime.class)))
                .thenReturn(15L);

        when(eventRepository.findCheapestPriceInFuture(any(OffsetDateTime.class)))
                .thenReturn(new BigDecimal("250.00"));

        UserDashboardDto result = dashboardService.getUserDashboard();

        assertNotNull(result);

        assertEquals(1, result.getUpcomingEvents().size());
        assertEquals("Koncert", result.getUpcomingEvents().get(0).getName());

        assertEquals(15L, result.getTotalUpcomingCount());
        assertEquals(new BigDecimal("250.00"), result.getCheapestTicketPrice());

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(eventService).list(any(EventFilter.class), pageableCaptor.capture());

        Pageable capturedPageable = pageableCaptor.getValue();
        assertEquals(3, capturedPageable.getPageSize(), "Mělo by se načítat jen top 3");
        assertEquals(0, capturedPageable.getPageNumber());
        assertTrue(capturedPageable.getSort().getOrderFor("startTime") != null, "Mělo by se řadit podle data");
    }

    @Test
    void getUserDashboard_NoEvents_ReturnsEmptyDto() {
        when(eventService.list(any(), any())).thenReturn(Page.empty());
        when(eventRepository.countByStartTimeAfter(any())).thenReturn(0L);
        when(eventRepository.findCheapestPriceInFuture(any())).thenReturn(null);

        UserDashboardDto result = dashboardService.getUserDashboard();

        assertNotNull(result);
        assertTrue(result.getUpcomingEvents().isEmpty());
        assertEquals(0L, result.getTotalUpcomingCount());
        assertNull(result.getCheapestTicketPrice());
    }

    @Test
    void getUserDashboard_InfinityPrice_ShouldReturnNull() {
        when(eventService.list(any(), any())).thenReturn(Page.empty());
        when(eventRepository.countByStartTimeAfter(any())).thenReturn(5L);

        when(eventRepository.findCheapestPriceInFuture(any()))
                .thenReturn(new BigDecimal("9999999"));

        UserDashboardDto result = dashboardService.getUserDashboard();

        assertNull(result.getCheapestTicketPrice(), "Cena 9999999 by se měla převést na null");
        assertEquals(5L, result.getTotalUpcomingCount());
    }

    @Test
    void getUserDashboard_HigherThanInfinityPrice_ShouldReturnNull() {
        when(eventService.list(any(), any())).thenReturn(Page.empty());
        when(eventRepository.countByStartTimeAfter(any())).thenReturn(1L);
        when(eventRepository.findCheapestPriceInFuture(any()))
                .thenReturn(new BigDecimal("10000000"));

        UserDashboardDto result = dashboardService.getUserDashboard();

        assertNull(result.getCheapestTicketPrice());
    }
}