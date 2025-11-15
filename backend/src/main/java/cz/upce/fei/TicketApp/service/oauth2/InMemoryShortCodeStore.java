package cz.upce.fei.TicketApp.service.oauth2;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

//TODO: do budoucna bude toto řešit Redis
/*
Jak se děje ouath2
Uživatel -> [Frontend] --klik--> Google OAuth
Google -> [Backend /login/oauth2/code/google] -> ověření + ShortCode
[Backend] --redirect--> Frontend /oauth2/callback?code=XXX
[Frontend] -> POST /api/auth/oauth/token { code }
[Backend] -> JWT
[Frontend] -> používá JWT v Authorization headeru
 */
@Service
public class InMemoryShortCodeStore implements ShortCodeStore {

    private final Map<String, String> codeToEmail = new ConcurrentHashMap<>();
    private final Map<String, Instant> codeExpiry = new ConcurrentHashMap<>();
    private final long ttlSeconds;

    public InMemoryShortCodeStore() {
        this.ttlSeconds = 120; // kód platí 2 minuty
    }
    public InMemoryShortCodeStore(long ttlSeconds) { // pro testovaci ucely
        this.ttlSeconds = ttlSeconds;
    }
    @Override
    public String generateCode(String email) {
        String code = UUID.randomUUID().toString();
        codeToEmail.put(code, email);
        codeExpiry.put(code, Instant.now().plusSeconds(ttlSeconds));
        return code;
    }

    @Override
    public String consumeCode(String code) {
        System.out.println("Consuming code: " + code); // DEBUG
        System.out.println("Available codes: " + codeToEmail.keySet()); // DEBUG

        Instant exp = codeExpiry.get(code);
        if (exp == null) {
            System.out.println("Code not found: " + code); // DEBUG
            return null;
        }

        if (Instant.now().isAfter(exp)) {
            System.out.println("Code expired: " + code); // DEBUG
            codeToEmail.remove(code);
            codeExpiry.remove(code);
            return null;
        }

        String email = codeToEmail.remove(code);
        codeExpiry.remove(code);
        System.out.println("Successfully consumed code for email: " + email); // DEBUG
        return email;
    }
}
