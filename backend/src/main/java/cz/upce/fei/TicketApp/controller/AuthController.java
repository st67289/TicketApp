package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // REGISTRACE
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq req) {
        var existing = users.findByEmail(req.getEmail()).orElse(null);
        if (existing != null) {
            if (existing.getOauthProvider() != null) {
                return ResponseEntity.badRequest().body(Map.of("error","Email je už spojen s OAuth účtem."));
            }
            return ResponseEntity.badRequest().body(Map.of("error","Email už existuje."));
        }

        AppUser u = AppUser.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(UserRoles.USER)
                .build();
        users.save(u);

        String token = jwtService.generateToken(u.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

    // LOGIN – lokální
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        var u = users.findByEmail(req.getEmail()).orElse(null);
        if (u == null || u.getPasswordHash() == null) {
            return ResponseEntity.status(401).body(Map.of("error","Nesprávný email/heslo."));
        }
        if (u.getOauthProvider() != null) {
            return ResponseEntity.status(403).body(Map.of("error","Účet je připojen přes OAuth, použij Google login."));
        }
        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error","Nesprávný email/heslo."));
        }
        String token = jwtService.generateToken(u.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

    // funguje pro oba způsoby JWT i OATUH
    @GetMapping("/me")
    public Map<String, Object> me(Principal principal) {
        if (principal == null) return Map.of("authenticated", false);
        String email = principal.getName();
        var u = users.findByEmail(email).orElse(null);
        return Map.of(
                "authenticated", u != null,
                "email", email,
                "role", u != null ? u.getRole() : null,
                "provider", u != null ? u.getOauthProvider() : null
        );
    }

    @Data
    public static class RegisterReq { private String email; private String password; }
    @Data
    public static class LoginReq { private String email; private String password; }
}
