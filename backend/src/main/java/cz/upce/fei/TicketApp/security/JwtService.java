package cz.upce.fei.TicketApp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final String secret = "abcdefghijklmnopqrstuvwxyz123456789987654321abcdefghijklmopqrstuvwxyz";
    private final long ttlSeconds = 60 * 60 * 24; // 24h

    private Key key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String subject) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key(), SignatureAlgorithm.HS256) //  0.11.5 JJWT
                .compact();
    }

    public String parseSubject(String token) {
        return Jwts.parserBuilder()            //  0.11.5 JJWT
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
