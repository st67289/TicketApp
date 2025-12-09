package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.stats.SalesStatsDto;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminStatsServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private AdminStatsService adminStatsService;

    @Test
    void getEventStats_Success_MapsDataCorrectly() {
        Long eventId = 1L;
        LocalDate localDate1 = LocalDate.of(2025, 5, 20);
        LocalDate localDate2 = LocalDate.of(2025, 5, 21);

        Date sqlDate1 = Date.valueOf(localDate1);
        Date sqlDate2 = Date.valueOf(localDate2);

        Object[] row1 = new Object[]{ sqlDate1, 10L, 5L };
        Object[] row2 = new Object[]{ sqlDate2, 0L, 25L };

        List<Object[]> mockDbResult = List.of(row1, row2);

        when(ticketRepository.getSalesStatsByEventId(eventId)).thenReturn(mockDbResult);

        List<SalesStatsDto> result = adminStatsService.getEventStats(eventId);

        assertNotNull(result);
        assertEquals(2, result.size());

        SalesStatsDto dto1 = result.get(0);
        assertEquals(localDate1, dto1.getDate());
        assertEquals(10L, dto1.getSeatingCount());
        assertEquals(5L, dto1.getStandingCount());

        SalesStatsDto dto2 = result.get(1);
        assertEquals(localDate2, dto2.getDate());
        assertEquals(0L, dto2.getSeatingCount());
        assertEquals(25L, dto2.getStandingCount());
    }

    @Test
    void getEventStats_DifferentNumberTypes_ShouldHandleInteger() {
        Date sqlDate = Date.valueOf(LocalDate.of(2025, 1, 1));

        Object[] row = new Object[]{ sqlDate, 15, 10 };

        List<Object[]> mockData = Collections.singletonList(row);

        when(ticketRepository.getSalesStatsByEventId(1L)).thenReturn(mockData);

        List<SalesStatsDto> result = adminStatsService.getEventStats(1L);

        assertEquals(15L, result.get(0).getSeatingCount());
        assertEquals(10L, result.get(0).getStandingCount());
    }

    @Test
    void getEventStats_NoData_ReturnsEmptyList() {
        when(ticketRepository.getSalesStatsByEventId(99L)).thenReturn(Collections.emptyList());

        List<SalesStatsDto> result = adminStatsService.getEventStats(99L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}