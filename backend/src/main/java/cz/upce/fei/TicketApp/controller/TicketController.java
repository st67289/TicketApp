package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.ticket.TicketDto;
import cz.upce.fei.TicketApp.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.security.Principal;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<TicketDto>> myTickets(
            Principal principal,
            @PageableDefault(size = 20, sort = "order.createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ticketService.getMyTickets(principal.getName(), pageable));
    }

    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> getTicketQr(@PathVariable Long id, Principal principal) {
        byte[] qrImage = ticketService.getTicketQr(id, principal.getName());
        return ResponseEntity.ok(qrImage);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id, Principal principal) {
        byte[] pdfBytes = ticketService.getTicketPdf(id, principal.getName());

        HttpHeaders headers = new HttpHeaders();
        // Poznámka: Název souboru (ticket_{id}.pdf) by ideálně mohl řešit taky service a vracet nějaký wrapper objekt,
        // ale nechat to zde je pro jednoduchost OK.
        headers.setContentDispositionFormData("attachment", "vstupenka_" + id + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}