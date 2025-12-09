package cz.upce.fei.TicketApp.service.passwordReset;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetCode(String to, String code) {
        // TODO posílat potom normálně na maila asi idk
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Obnovení hesla – TicketApp");
            msg.setText("Tvůj ověřovací kód: " + code + "\nPlatnost 15 minut.");
            mailSender.send(msg);
        } catch (Exception ex) {
            //log
            System.out.println("DEV sendResetCode to " + to + " code=" + code);
        }
    }

    @Async // Odesílání trvá dlouho, ať neblokujeme uživatele (nutné @EnableAsync v AppConfig)
    public void sendTickets(String to, String subject, String text, Map<String, byte[]> attachments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true = multipart (pro přílohy)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // false = plain text, true = html

            // Přidání všech PDF příloh
            for (Map.Entry<String, byte[]> entry : attachments.entrySet()) {
                String filename = entry.getKey();
                byte[] content = entry.getValue();

                helper.addAttachment(filename, new ByteArrayResource(content), "application/pdf");
            }

            mailSender.send(message);
            System.out.println("Email se vstupenkami odeslán na: " + to);

        } catch (Exception e) {
            System.err.println("Chyba při odesílání emailu se vstupenkami: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
