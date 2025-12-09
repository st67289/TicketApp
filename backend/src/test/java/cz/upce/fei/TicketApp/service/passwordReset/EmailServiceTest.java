package cz.upce.fei.TicketApp.service.passwordReset;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    // ============================================
    // TESTY PRO SEND RESET CODE (SimpleMailMessage)
    // ============================================

    @Test
    void sendResetCode_Success() {
        String to = "user@example.com";
        String code = "123456";

        emailService.sendResetCode(to, code);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage);
        assertEquals(to, sentMessage.getTo()[0]);
        assertEquals("Obnovení hesla – TicketApp", sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains(code));
        assertTrue(sentMessage.getText().contains("15 minut"));
    }

    @Test
    void sendResetCode_Exception_ShouldBeCaught() {
        doThrow(new RuntimeException("SMTP Error")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> emailService.sendResetCode("test@test.com", "code"));

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    // ============================================
    // TESTY PRO SEND TICKETS (MimeMessage)
    // ============================================

    @Test
    void sendTickets_Success() {
        MimeMessage mimeMessageMock = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessageMock);

        String to = "buyer@example.com";
        String subject = "Vstupenky";
        String text = "Díky za nákup";
        Map<String, byte[]> attachments = new HashMap<>();
        attachments.put("ticket1.pdf", new byte[]{1, 2, 3});
        attachments.put("ticket2.pdf", new byte[]{4, 5, 6});

        emailService.sendTickets(to, subject, text, attachments);

        verify(mailSender).createMimeMessage();

        verify(mailSender).send(mimeMessageMock);
    }

    @Test
    void sendTickets_MessagingException_ShouldBeCaught() {
        MimeMessage mimeMessageMock = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessageMock);

        doThrow(new RuntimeException("SMTP Connection failed"))
                .when(mailSender).send(mimeMessageMock);

        Map<String, byte[]> attachments = Map.of("ticket.pdf", new byte[]{1});

        assertDoesNotThrow(() ->
                emailService.sendTickets("fail@test.com", "Subj", "Txt", attachments)
        );

        verify(mailSender).send(mimeMessageMock);
    }
}