package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.dashboard.UserDashboardDto;
import cz.upce.fei.TicketApp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDashboardDto> getUserDashboard() {
        return ResponseEntity.ok(dashboardService.getUserDashboard());
    }
}