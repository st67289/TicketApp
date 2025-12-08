package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.ticket.TicketDto;
import cz.upce.fei.TicketApp.model.entity.*;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private TicketService ticketService;

    // Testovací data
    private AppUser user;
    private Order order;
    private Venue venue;
    private Event event;
    private Seat seat;
    private Ticket ticket;

    private final String USER_EMAIL = "user@test.com";
    private final String OTHER_EMAIL = "hacker@test.com";
    private final Long TICKET_ID = 100L;

    @BeforeEach
    void setup() {
        // 1. Nastavení uživatele
        user = AppUser.builder()
                .id(1L)
                .email(USER_EMAIL)
                .build();

        // 2. Nastavení objednávky (propojení na uživatele je klíčové pro kontrolu vlastníka)
        order = Order.builder()
                .id(50L)
                .appUser(user)
                .build();

        // 3. Nastavení Venue a Eventu
        venue = Venue.builder()
                .id(10L)
                .name("O2 Arena")
                .address("Prague")
                .build();

        event = Event.builder()
                .id(20L)
                .name("Koncert")
                .venue(venue)
                .startTime(OffsetDateTime.now().plusDays(1))
                .build();

        // 4. Nastavení Sedadla
        seat = Seat.builder()
                .id(5L)
                .seatRow("A")
                .seatNumber("1")
                .venue(venue)
                .build();

        // 5. Nastavení Ticketu
        ticket = Ticket.builder()
                .id(TICKET_ID)
                .ticketCode("T-123456")
                .price(BigDecimal.valueOf(1000))
                .status(TicketStatus.ISSUED)
                .event(event)
                .seat(seat)
                .order(order) // Důležité!
                .build();
    }

    // ==========================================
    // TESTY: getMyTickets
    // ==========================================

    @Test
    void getMyTickets_ReturnsMappedPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        // Simulujeme, že repozitář vrátí stránku obsahující jeden ticket
        Page<Ticket> ticketPage = new PageImpl<>(List.of(ticket));

        when(ticketRepository.findAllByOrderAppUserEmailAndStatusIn(
                eq(USER_EMAIL), any(), eq(pageable)))
                .thenReturn(ticketPage);

        // Act
        Page<TicketDto> result = ticketService.getMyTickets(USER_EMAIL, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements()); // Celkový počet prvků

        TicketDto dto = result.getContent().get(0);
        assertEquals(TICKET_ID, dto.getId());
        assertEquals("Koncert", dto.getEventName());
        assertEquals("O2 Arena", dto.getVenue().getName());
        assertEquals("A", dto.getSeatRow());
        assertEquals("1", dto.getSeatNumber());
        assertEquals(TicketStatus.ISSUED, dto.getStatus());
    }

    @Test
    void getMyTickets_ReturnsEmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        when(ticketRepository.findAllByOrderAppUserEmailAndStatusIn(
                eq(USER_EMAIL), any(), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        Page<TicketDto> result = ticketService.getMyTickets(USER_EMAIL, pageable);

        // Assert
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    // ==========================================
    // TESTY: getTicketQr (Security & Logic)
    // ==========================================

    @Test
    void getTicketQr_Owner_ReturnsBytes() {
        // Arrange
        byte[] mockImage = new byte[]{1, 2, 3};
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(ticket));
        when(qrCodeService.generateQrCodeImage("T-123456", 200, 200)).thenReturn(mockImage);

        // Act
        byte[] result = ticketService.getTicketQr(TICKET_ID, USER_EMAIL);

        // Assert
        assertArrayEquals(mockImage, result);
        verify(qrCodeService).generateQrCodeImage(anyString(), anyInt(), anyInt());
    }

    @Test
    void getTicketQr_NotOwner_ThrowsAccessDenied() {
        // Arrange
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(ticket));

        // Act & Assert
        // Voláme s OTHER_EMAIL, ale lístek patří USER_EMAIL
        assertThrows(AccessDeniedException.class, () ->
                ticketService.getTicketQr(TICKET_ID, OTHER_EMAIL));

        // QR service by se neměla zavolat
        verifyNoInteractions(qrCodeService);
    }

    @Test
    void getTicketQr_NotFound_ThrowsEntityNotFound() {
        // Arrange
        when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () ->
                ticketService.getTicketQr(999L, USER_EMAIL));
    }

    // ==========================================
    // TESTY: getTicketPdf (Security & Logic)
    // ==========================================

    @Test
    void getTicketPdf_Owner_ReturnsBytes() {
        // Arrange
        byte[] mockPdf = new byte[]{9, 8, 7};
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(ticket));
        when(pdfService.generateTicketPdf(ticket)).thenReturn(mockPdf);

        // Act
        byte[] result = ticketService.getTicketPdf(TICKET_ID, USER_EMAIL);

        // Assert
        assertArrayEquals(mockPdf, result);
        verify(pdfService).generateTicketPdf(ticket);
    }

    @Test
    void getTicketPdf_NotOwner_ThrowsAccessDenied() {
        // Arrange
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(ticket));

        // Act & Assert
        assertThrows(AccessDeniedException.class, () ->
                ticketService.getTicketPdf(TICKET_ID, OTHER_EMAIL));

        verifyNoInteractions(pdfService);
    }

    // ==========================================
    // TESTY: Mapování (Edge cases)
    // ==========================================

    @Test
    void toDto_StandingTicket_MapsCorrectly() {
        // Arrange
        ticket.setSeat(null);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ticket> ticketPage = new PageImpl<>(List.of(ticket));

        when(ticketRepository.findAllByOrderAppUserEmailAndStatusIn(
                eq(USER_EMAIL), any(), eq(pageable)))
                .thenReturn(ticketPage);

        // Act
        Page<TicketDto> result = ticketService.getMyTickets(USER_EMAIL, pageable);

        // Assert
        TicketDto dto = result.getContent().get(0);
        assertNull(dto.getSeatRow());
        assertNull(dto.getSeatNumber());
        assertEquals("Koncert", dto.getEventName());
    }
}
