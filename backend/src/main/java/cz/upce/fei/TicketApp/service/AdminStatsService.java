package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.stats.SalesStatsDto;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<SalesStatsDto> getEventStats(Long eventId) {
        List<Object[]> rawData = ticketRepository.getSalesStatsByEventId(eventId);

        return rawData.stream().map(row -> {
            // Postgres vrací java.sql.Date nebo LocalDate podle driveru
            LocalDate date = ((Date) row[0]).toLocalDate();
            long seating = ((Number) row[1]).longValue();
            long standing = ((Number) row[2]).longValue();
            return new SalesStatsDto(date, seating, standing);
        }).collect(Collectors.toList());
    }
}