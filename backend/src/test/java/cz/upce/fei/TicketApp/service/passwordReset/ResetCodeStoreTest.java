package cz.upce.fei.TicketApp.service.passwordReset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResetCodeStoreTest {

    @Mock
    private RedissonClient redisson;

    @Mock
    private RBucket<String> bucket;

    @InjectMocks
    private ResetCodeStore resetCodeStore;

    @BeforeEach
    void setUp() {
        lenient().when(redisson.<String>getBucket(anyString())).thenReturn(bucket);
    }

    @Test
    void issueCode_GeneratesCodeAndSavesToRedis() {
        String email = "Test@Example.com";

        String code = resetCodeStore.issueCode(email);

        assertNotNull(code);
        assertEquals(6, code.length(), "Kód musí mít 6 znaků");
        assertTrue(code.matches("\\d{6}"), "Kód musí obsahovat jen číslice");

        verify(redisson).getBucket("pwd_reset:test@example.com");

        verify(bucket).set(eq(code), eq(Duration.ofMinutes(15)));
    }

    @Test
    void consume_CorrectCode_ReturnsTrueAndDeletes() {
        String email = "user@example.com";
        String storedCode = "123456";

        when(bucket.get()).thenReturn(storedCode);

        boolean result = resetCodeStore.consume(email, "123456");

        assertTrue(result, "Mělo by vrátit true pro shodný kód");

        verify(bucket).delete();
        verify(redisson).getBucket("pwd_reset:user@example.com");
    }

    @Test
    void consume_WrongCode_ReturnsFalseAndDoesNotDelete() {
        String email = "user@example.com";
        String storedCode = "123456";

        when(bucket.get()).thenReturn(storedCode);

        boolean result = resetCodeStore.consume(email, "999999");

        assertFalse(result, "Mělo by vrátit false pro neshodný kód");

        verify(bucket, never()).delete();
    }

    @Test
    void consume_CodeExpiredOrNotExists_ReturnsFalse() {
        String email = "user@example.com";

        when(bucket.get()).thenReturn(null);

        boolean result = resetCodeStore.consume(email, "123456");

        assertFalse(result);
        verify(bucket, never()).delete();
    }

    @Test
    void consume_CaseInsensitivityCheck() {
        String email = "Upper@Case.COM";
        String code = "111111";

        when(bucket.get()).thenReturn(code);

        resetCodeStore.consume(email, code);

        verify(redisson).getBucket("pwd_reset:upper@case.com");
    }
}