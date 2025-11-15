package cz.upce.fei.TicketApp.security;

import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generateToken_ShouldReturnNonEmptyToken() {
        String token = jwtService.generateToken("user@example.com", "USER");
        assertNotNull(token, "Token should not be null");
        assertFalse(token.isBlank(), "Token should not be empty");
    }

    @Test
    void generateToken_AndParseSubject_ShouldReturnCorrectSubject() {
        String email = "user@example.com";
        String role = "USER";

        String token = jwtService.generateToken(email, role);
        String parsedEmail = jwtService.parseSubject(token);

        assertEquals(email, parsedEmail, "Parsed subject should match the email used for token generation");
    }

    @Test
    void generatedToken_ShouldContainRoleClaim() {
        String email = "user@example.com";
        String role = "ADMIN";

        String token = jwtService.generateToken(email, role);

        String parsedRole = io.jsonwebtoken.Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(
                        "abcdefghijklmnopqrstuvwxyz123456789987654321abcdefghijklmopqrstuvwxyz"
                                .getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);

        assertEquals(role, parsedRole, "Token should contain correct role claim");
    }
}
