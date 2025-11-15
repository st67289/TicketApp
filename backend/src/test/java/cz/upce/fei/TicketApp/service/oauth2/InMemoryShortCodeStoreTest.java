package cz.upce.fei.TicketApp.service.oauth2;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InMemoryShortCodeStoreTest {

    private InMemoryShortCodeStore store;

    @BeforeEach
    void setup() {
        store = new InMemoryShortCodeStore();
    }

    @Test
    void generateCode_ReturnsNonNullCode() {
        String email = "user@example.com";
        String code = store.generateCode(email);

        assertNotNull(code);
        assertNotEquals("", code);
    }

    @Test
    void consumeCode_ReturnsEmailAndRemovesCode() {
        String email = "user@example.com";
        String code = store.generateCode(email);

        String consumedEmail = store.consumeCode(code);

        assertEquals(email, consumedEmail);

        // Po spotřebování kód už neexistuje
        assertNull(store.consumeCode(code));
    }

    @Test
    void consumeCode_ReturnsNullForUnknownCode() {
        assertNull(store.consumeCode("nonexistent-code"));
    }

    @Test
    void consumeCode_ExpiresCorrectly() throws InterruptedException {
        InMemoryShortCodeStore store = new InMemoryShortCodeStore(1);
        String email = "test@example.com";
        String code = store.generateCode(email);

        Thread.sleep(1500);
        assertNull(store.consumeCode(code));
    }


    @Test
    void codeCannotBeUsedTwice() {
        String email = "user@example.com";
        String code = store.generateCode(email);

        String firstUse = store.consumeCode(code);
        String secondUse = store.consumeCode(code);

        assertEquals(email, firstUse);
        assertNull(secondUse);
    }
}
