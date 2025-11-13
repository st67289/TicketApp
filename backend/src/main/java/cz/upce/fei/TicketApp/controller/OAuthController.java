package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.security.JwtService;
import cz.upce.fei.TicketApp.service.oauth2.ShortCodeStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final ShortCodeStore shortCodeStore;
    private final JwtService jwtService;
    private final UserRepository users;

    //Pro oauth 2 - Endpoint pro výměnu kódu za JWT
    @PostMapping("/token")
    public ResponseEntity<?> exchangeCode(@RequestBody Map<String, String> body) {
        System.out.println("Received body: " + body); // DEBUG
        String code = body.get("code");

        if (code == null || code.trim().isEmpty()) {
            System.out.println("Code is null or empty"); // DEBUG
            return ResponseEntity.status(400).body(Map.of("error", "Code is required"));
        }

        System.out.println("Looking for code: " + code); // DEBUG
        String email = shortCodeStore.consumeCode(code);

        if (email == null) {
            System.out.println("Invalid or expired code: " + code); // DEBUG
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired code"));
        }

        var user = users.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        String jwt = jwtService.generateToken(email, user.getRole().name());
        System.out.println("Generated JWT: " + jwt);
        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "role", user.getRole().name()
        ));
    }

}
