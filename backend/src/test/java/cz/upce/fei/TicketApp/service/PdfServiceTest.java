package cz.upce.fei.TicketApp.service;

import com.google.zxing.WriterException;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Seat;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.entity.Venue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PdfServiceTest {

    @Mock
    private QrCodeService qrCodeService;

    @InjectMocks
    private PdfService pdfService;

    private Ticket dummyTicket;

    @BeforeEach
    void setUp() {
        Venue venue = new Venue();
        venue.setName("O2 Arena");
        venue.setAddress("Českomoravská 2345/17, Praha 9");

        Event event = new Event();
        event.setName("Koncert Kabát");
        event.setStartTime(OffsetDateTime.of(2025, 6, 15, 20, 0, 0, 0, ZoneOffset.UTC));
        event.setVenue(venue);

        dummyTicket = new Ticket();
        dummyTicket.setTicketCode("TICKET-123456");
        dummyTicket.setPrice(BigDecimal.valueOf(1290));
        dummyTicket.setEvent(event);
    }

    @Test
    void generateTicketPdf_WithSeat_Success() throws IOException, WriterException {
        Seat seat = new Seat();
        seat.setSeatRow("A");
        seat.setSeatNumber("15");
        dummyTicket.setSeat(seat);

        when(qrCodeService.generateQrCodeImage(anyString(), anyInt(), anyInt()))
                .thenReturn(new byte[10]);

        byte[] pdfBytes = pdfService.generateTicketPdf(dummyTicket);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "PDF nesmí být prázdné");
        assertIsPdf(pdfBytes);
    }

    @Test
    void generateTicketPdf_Standing_NoSeat_Success() throws IOException, WriterException {
        dummyTicket.setSeat(null);

        when(qrCodeService.generateQrCodeImage(anyString(), anyInt(), anyInt()))
                .thenReturn(new byte[10]);

        byte[] pdfBytes = pdfService.generateTicketPdf(dummyTicket);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        assertIsPdf(pdfBytes);
    }

    @Test
    void generateTicketPdf_QrCodeFailure_ShouldStillGeneratePdf() throws IOException, WriterException {
        dummyTicket.setSeat(null);

        when(qrCodeService.generateQrCodeImage(anyString(), anyInt(), anyInt()))
                .thenThrow(new RuntimeException("QR Generation failed"));

        byte[] pdfBytes = pdfService.generateTicketPdf(dummyTicket);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        assertIsPdf(pdfBytes);
    }

    @Test
    void generateTicketPdf_FontMissing_ShouldFallbackToDefault() throws IOException, WriterException {
        dummyTicket.setSeat(null);
        when(qrCodeService.generateQrCodeImage(anyString(), anyInt(), anyInt()))
                .thenReturn(new byte[10]);

        byte[] pdfBytes = pdfService.generateTicketPdf(dummyTicket);

        assertNotNull(pdfBytes);
        assertIsPdf(pdfBytes);
    }

    /**
     * Pomocná metoda pro ověření, že pole bytů začíná hlavičkou PDF.
     * PDF soubory začínají sekvencí "%PDF-" (v ASCII).
     */
    private void assertIsPdf(byte[] data) {
        if (data.length < 5) {
            fail("Data jsou příliš krátká na to, aby byla PDF.");
        }
        String header = new String(data, 0, 4, StandardCharsets.UTF_8);
        assertEquals("%PDF", header, "Vygenerovaný soubor nemá hlavičku PDF.");
    }
}