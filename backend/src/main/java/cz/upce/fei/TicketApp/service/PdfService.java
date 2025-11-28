package cz.upce.fei.TicketApp.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final QrCodeService qrCodeService;

    // Barvy (ladíme do tmavé modré jako máš frontend)
    private static final Color PRIMARY_COLOR = new Color(24, 29, 47); // #181d2f
    private static final Color ACCENT_COLOR = new Color(34, 211, 238); // #22d3ee (tyrkysová)
    private static final Color TEXT_COLOR = Color.BLACK;
    private static final Color WHITE = Color.WHITE;

    public byte[] generateTicketPdf(Ticket ticket) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);

            document.open();

            // 1. NAČTENÍ FONTU (pro Češtinu)
            // Musíš mít soubor v src/main/resources/fonts/Roboto-Regular.ttf
            // Pokud font nemáš, stáhni ho. Bez toho nebudou fungovat háčky a čárky.
            BaseFont baseFont;
            try {
                ClassPathResource fontResource = new ClassPathResource("fonts/Roboto-Regular.ttf");
                // IDENTITY_H je klíčové pro UTF-8 (češtinu)
                baseFont = BaseFont.createFont(fontResource.getPath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            } catch (Exception e) {
                // Fallback, kdyby se font nepodařilo načíst (bude bez češtiny)
                System.err.println("Nepodařilo se načíst vlastní font: " + e.getMessage());
                baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            }

            Font fontTitle = new Font(baseFont, 24, Font.BOLD, WHITE);
            Font fontLabel = new Font(baseFont, 10, Font.NORMAL, Color.GRAY);
            Font fontValue = new Font(baseFont, 14, Font.BOLD, TEXT_COLOR);
            Font fontPrice = new Font(baseFont, 20, Font.BOLD, ACCENT_COLOR);
            Font fontSmall = new Font(baseFont, 9, Font.NORMAL, Color.GRAY);

            // 2. HLAVNÍ KONTEJNER (Tabulka s rámečkem)
            PdfPTable mainTable = new PdfPTable(1);
            mainTable.setWidthPercentage(80); // Lístek nebude přes celou A4
            mainTable.setSpacingBefore(20);

            // --- HLAVIČKA (Tmavé pozadí) ---
            PdfPCell headerCell = new PdfPCell(new Phrase("VSTUPENKA", fontTitle));
            headerCell.setBackgroundColor(PRIMARY_COLOR);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerCell.setPadding(15);
            headerCell.setBorderColor(PRIMARY_COLOR);
            mainTable.addCell(headerCell);

            // --- TĚLO LÍSTKU (Bílé pozadí) ---
            PdfPCell bodyCell = new PdfPCell();
            bodyCell.setBackgroundColor(WHITE);
            bodyCell.setPadding(20);
            bodyCell.setBorderColor(Color.LIGHT_GRAY);

            // Vnořená tabulka pro obsah (Info vlevo, QR vpravo)
            PdfPTable contentTable = new PdfPTable(new float[]{2, 1}); // Poměr 2:1
            contentTable.setWidthPercentage(100);

            // LEVÝ SLOUPEC (Informace)
            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);

            // Název akce
            infoCell.addElement(new Phrase("AKCE", fontLabel));
            infoCell.addElement(new Phrase(ticket.getEvent().getName(), fontValue));
            infoCell.addElement(new Phrase("\n", fontSmall)); // mezera

            // Datum a čas
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd. MMMM yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            infoCell.addElement(new Phrase("DATUM A ČAS", fontLabel));
            infoCell.addElement(new Phrase(
                    ticket.getEvent().getStartTime().format(dateFormatter) + " v " +
                            ticket.getEvent().getStartTime().format(timeFormatter), fontValue));
            infoCell.addElement(new Phrase("\n", fontSmall));

            // Místo konání
            infoCell.addElement(new Phrase("MÍSTO", fontLabel));
            infoCell.addElement(new Phrase(ticket.getEvent().getVenue().getName(), fontValue));
            infoCell.addElement(new Phrase(ticket.getEvent().getVenue().getAddress(), fontSmall));
            infoCell.addElement(new Phrase("\n", fontSmall));

            // Sedadlo
            infoCell.addElement(new Phrase("VÁŠ LÍSTEK", fontLabel));
            String seatInfo = (ticket.getSeat() == null)
                    ? "NA STÁNÍ"
                    : "Řada: " + ticket.getSeat().getSeatRow() + "  |  Sedadlo: " + ticket.getSeat().getSeatNumber();
            infoCell.addElement(new Phrase(seatInfo, fontValue));

            contentTable.addCell(infoCell);

            // PRAVÝ SLOUPEC (QR Kód a Cena)
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            // QR Obrázek
            byte[] qrBytes = qrCodeService.generateQrCodeImage(ticket.getTicketCode(), 300, 300);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.scaleToFit(120, 120);
            qrImage.setAlignment(Element.ALIGN_CENTER);

            rightCell.addElement(qrImage);

            // Kód pod QR
            Paragraph codeP = new Paragraph(ticket.getTicketCode(), fontSmall);
            codeP.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(codeP);

            // Cena (Mezera a pak cena)
            rightCell.addElement(new Phrase("\n\n"));
            Paragraph priceP = new Paragraph(ticket.getPrice() + " Kč", fontPrice);
            priceP.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(priceP);

            contentTable.addCell(rightCell);

            // Přidáme obsahovou tabulku do těla lístku
            bodyCell.addElement(contentTable);
            mainTable.addCell(bodyCell);

            // --- PATIČKA (Tenký proužek) ---
            PdfPCell footerCell = new PdfPCell(new Phrase("TicketApp - Semestrální práce", fontSmall));
            footerCell.setBackgroundColor(new Color(240, 240, 240));
            footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            footerCell.setPadding(5);
            footerCell.setBorderColor(Color.LIGHT_GRAY);
            mainTable.addCell(footerCell);

            // Přidat vše do dokumentu
            document.add(mainTable);

            // Přidat "střihací" čáru (volitelné)
            Paragraph cutLine = new Paragraph("\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n");
            cutLine.setAlignment(Element.ALIGN_CENTER);
            cutLine.getFont().setColor(Color.LIGHT_GRAY);
            document.add(cutLine);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Chyba při generování PDF", e);
        }
    }
}