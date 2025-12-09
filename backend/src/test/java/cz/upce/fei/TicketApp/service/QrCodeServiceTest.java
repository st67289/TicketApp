package cz.upce.fei.TicketApp.service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.Result;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.*;

class QrCodeServiceTest {

    private final QrCodeService qrCodeService = new QrCodeService();

    @Test
    void generateQrCodeImage_Success_ReturnsValidPng() {
        String text = "Ticket-12345";
        int width = 200;
        int height = 200;

        byte[] imageBytes = qrCodeService.generateQrCodeImage(text, width, height);

        assertNotNull(imageBytes);
        assertTrue(imageBytes.length > 0);

        assertEquals((byte) 0x89, imageBytes[0]);
        assertEquals((byte) 0x50, imageBytes[1]);
        assertEquals((byte) 0x4E, imageBytes[2]);
        assertEquals((byte) 0x47, imageBytes[3]);
    }

    @Test
    void generateQrCodeImage_RoundTrip_DecodeCheck() throws Exception {
        String originalText = "SuperTajnyKod123";

        byte[] imageBytes = qrCodeService.generateQrCodeImage(originalText, 300, 300);

        ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
        BufferedImage bufferedImage = ImageIO.read(bais);

        assertNotNull(bufferedImage, "Obrázek se nepodařilo načíst (není validní formát)");

        BinaryBitmap binaryBitmap = new BinaryBitmap(
                new HybridBinarizer(
                        new BufferedImageLuminanceSource(bufferedImage)
                )
        );
        Result result = new MultiFormatReader().decode(binaryBitmap);

        assertEquals(originalText, result.getText());
    }

    @Test
    void generateQrCodeImage_InvalidDimensions_ThrowsException() {
        assertThrows(RuntimeException.class, () ->
                qrCodeService.generateQrCodeImage("text", -100, 100)
        );
    }

    @Test
    void generateQrCodeImage_EmptyText_ThrowsException() {
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                qrCodeService.generateQrCodeImage("", 200, 200)
        );
        assertEquals("Chyba při generování QR kódu", ex.getMessage());
    }
}