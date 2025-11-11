package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.AuthResponseDto;
import cz.upce.fei.TicketApp.dto.LoginDto;
import cz.upce.fei.TicketApp.dto.RegisterDto;
import cz.upce.fei.TicketApp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterDto req) {
        try {
            AuthResponseDto response = userService.register(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new AuthResponseDto(null, null, null, null)
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto req) {
        try {
            AuthResponseDto response = userService.login(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // můžeš rozlišit status podle zprávy (OAuth 403, běžný login 401)
            String msg = e.getMessage();
            return ResponseEntity.status(msg.contains("OAuth") ? 403 : 401)
                    .body(new AuthResponseDto(null, null, null, null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto> me(Principal principal) {
        AuthResponseDto response = userService.me(principal);
        return ResponseEntity.ok(response);
    }
}
