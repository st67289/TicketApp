package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.common.SeatDto;
import cz.upce.fei.TicketApp.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatDto>> getVenueSeats(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getSeatsByVenueId(id));
    }
}