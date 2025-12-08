package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.dto.ticket.TicketDto;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;
    private final PdfService pdfService;

    /**
     * Vrátí seznam lístků pro daného uživatele (podle emailu)
     */
    @Transactional(readOnly = true)
    public Page<TicketDto> getMyTickets(String email, Pageable pageable) {
        return ticketRepository.findAllByOrderAppUserEmailAndStatusIn(
                email,
                List.of(TicketStatus.ISSUED, TicketStatus.USED),
                pageable
        ).map(this::toDto);
    }

    /**
     * Vygeneruje QR kód pro lístek.
     * Obsahuje kontrolu, zda lístek patří volajícímu uživateli.
     */
    @Transactional(readOnly = true)
    public byte[] getTicketQr(Long ticketId, String userEmail) {
        Ticket ticket = getTicketIfOwner(ticketId, userEmail);
        return qrCodeService.generateQrCodeImage(ticket.getTicketCode(), 200, 200);
    }

    /**
     * Vygeneruje PDF pro lístek.
     * Obsahuje kontrolu, zda lístek patří volajícímu uživateli.
     */
    @Transactional(readOnly = true)
    public byte[] getTicketPdf(Long ticketId, String userEmail) {
        Ticket ticket = getTicketIfOwner(ticketId, userEmail);
        return pdfService.generateTicketPdf(ticket);
    }

    // --- Privátní pomocné metody ---

    /**
     * Najde ticket a ověří vlastníka.
     * Pokud ticket neexistuje -> EntityNotFoundException
     * Pokud ticket patří někomu jinému -> AccessDeniedException
     */
    private Ticket getTicketIfOwner(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket nenalezen: " + ticketId));

        // Bezpečnostní kontrola: Patří ticket přihlášenému uživateli?
        // Cesta: Ticket -> Order -> AppUser -> Email
        String ownerEmail = ticket.getOrder().getAppUser().getEmail();

        if (!ownerEmail.equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Nemáte oprávnění k tomuto lístku.");
        }

        return ticket;
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
                .status(t.getStatus())
                .eventName(event.getName())
                .eventStart(event.getStartTime())
                .venue(venueDto)
                .seatRow(seat != null ? seat.getSeatRow() : null)
                .seatNumber(seat != null ? seat.getSeatNumber() : null)
                .build();
    }
}