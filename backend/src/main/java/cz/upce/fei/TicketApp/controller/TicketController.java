package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.dto.ticket.TicketDto;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TicketDto>> myTickets(Principal principal) {
        // Najdeme všechny vstupenky, které jsou ISSUED nebo USED
        List<Ticket> tickets = ticketRepository.findAllByOrderAppUserEmailAndStatusIn(
                principal.getName(),
                List.of(TicketStatus.ISSUED, TicketStatus.USED)
        );

        List<TicketDto> dtos = tickets.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private TicketDto toDto(Ticket t) {
        var event = t.getEvent();
        var venue = event.getVenue();
        var seat = t.getSeat();

        VenueShortDto venueDto = VenueShortDto.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .build();

        return TicketDto.builder()
                .id(t.getId())
                .ticketCode(t.getTicketCode())
                .price(t.getPrice())
                .type(t.getTicketType())
                .status(t.getStatus())
                .eventName(event.getName())
                .eventStart(event.getStartTime())
                .venue(venueDto)
                .seatRow(seat != null ? seat.getSeatRow() : null)
                .seatNumber(seat != null ? seat.getSeatNumber() : null)
                .build();
    }
}