package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.stats.SalesStatsDto;
import cz.upce.fei.TicketApp.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService statsService;

    @GetMapping("/event/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<SalesStatsDto>> getEventStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getEventStats(id));
    }
}