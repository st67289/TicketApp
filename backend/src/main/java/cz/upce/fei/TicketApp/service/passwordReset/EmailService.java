package cz.upce.fei.TicketApp.service.passwordReset;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
}
