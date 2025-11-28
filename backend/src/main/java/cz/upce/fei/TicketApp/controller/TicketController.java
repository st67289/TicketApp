package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.dto.ticket.TicketDto;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import cz.upce.fei.TicketApp.service.QrCodeService;
import cz.upce.fei.TicketApp.service.PdfService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;
    private final PdfService pdfService;

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

    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> getTicketQr(@PathVariable Long id, Principal principal) {
        // 1. Najít ticket
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket nenalezen"));

        // 2. Bezpečnostní kontrola: Patří ticket přihlášenému uživateli?
        // Předpokládám cestu: Ticket -> Order -> AppUser -> Email
        if (!ticket.getOrder().getAppUser().getEmail().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(403).build();
        }

        // 3. Vygenerovat QR z kódu vstupenky (např. T-123456)
        byte[] qrImage = qrCodeService.generateQrCodeImage(ticket.getTicketCode(), 200, 200);

        return ResponseEntity.ok(qrImage);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id, Principal principal) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket nenalezen"));

        // Bezpečnostní kontrola vlastníka
        if (!ticket.getOrder().getAppUser().getEmail().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(403).build();
        }

        byte[] pdfBytes = pdfService.generateTicketPdf(ticket);

        // Nastavíme hlavičky, aby se to stáhlo jako soubor
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "vstupenka_" + ticket.getId() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}