package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.AuthResponseDto;
import cz.upce.fei.TicketApp.service.UserService;
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

    private final UserService userService;

    // Endpoint pro výměnu kódu za JWT
    @PostMapping("/token")
    public ResponseEntity<AuthResponseDto> exchangeCode(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.loginOAuth(body.get("code")));
    }
}
