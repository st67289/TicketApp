package cz.upce.fei.TicketApp.service.passwordReset;

import lombok.RequiredArgsConstructor;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class ResetCodeStore {

    private final RedissonClient redisson;
    private static final Duration TTL = Duration.ofMinutes(15);

    private String key(String email) {
        return "pwd_reset:" + email.toLowerCase();
    }

    public String issueCode(String email) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        RBucket<String> bucket = redisson.getBucket(key(email));
        bucket.set(code, TTL);
        return code;
    }

    // Vrátí true pokud kód sedí a hned ho smaže
    public boolean consume(String email, String code) {
        RBucket<String> bucket = redisson.getBucket(key(email));
        String stored = bucket.get();
        if (stored != null && stored.equals(code)) {
            bucket.delete();
            return true;
        }
        return false;
    }
}
