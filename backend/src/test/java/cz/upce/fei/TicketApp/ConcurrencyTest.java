package cz.upce.fei.TicketApp;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.entity.Cart;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.*;
import cz.upce.fei.TicketApp.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Pokud máš config v src/test/resources/application.properties, stačí @SpringBootTest.
// Pokud se jmenuje application-test.properties, odkomentuj @ActiveProfiles("test").
 @ActiveProfiles("test")
@SpringBootTest
public class ConcurrencyTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository users;
    @Autowired
    private EventRepository events;
    @Autowired
    private VenueRepository venues;
    @Autowired
    private TicketRepository tickets;
    @Autowired
    private CartRepository carts;

    private Long eventId;

    // Kapacita je jen 5, ale pokusů bude 10
    private final int CAPACITY = 5;
    private final int THREAD_COUNT = 10;

    @BeforeEach
    void setup() {
        // Vyčistíme DB (vazby se mohou bránit, proto v tomto pořadí nebo s cascade)
        tickets.deleteAll();
        carts.deleteAll();
        // Eventy a users mohou mít vazby, Spring Data JPA to obvykle zvládne,
        // ale pro jistotu mažeme "děti" před "rodiči".
        events.deleteAll();
        venues.deleteAll();
        users.deleteAll();

        // 1. Vytvoříme Venue
        Venue venue = Venue.builder()
                .name("Test Arena")
                .standingCapacity(CAPACITY)
                .address("Test Street 1")
                .build();
        venues.save(venue);

        // 2. Vytvoříme Event
        Event event = Event.builder()
                .name("Rock Concert")
                .venue(venue)
                .standingPrice(BigDecimal.valueOf(100))
                .startTime(OffsetDateTime.now().plusDays(1))
                .build();
        events.save(event);
        eventId = event.getId();

        // 3. Vytvoříme uživatele
        for (int i = 0; i < THREAD_COUNT; i++) {
            // POZOR: Nahraď UserRoles.USER tím, co máš ve svém enumu (např. CUSTOMER, CLIENT...)
            AppUser u = AppUser.builder()
                    .email("user" + i + "@test.com")
                    .passwordHash("hashedPassword123") // Opraveno dle entity
                    .firstName("Test")
                    .secondName("User")
                    .role(UserRoles.USER) // Nutné nastavit (nullable = false)
                    .isEnabled(true)      // Nutné, Lombok builder ignoruje default = true
                    .build();
            users.save(u);

            // Vytvoříme prázdný košík
            Cart c = Cart.builder()
                    .user(u)
                    .lastChanged(OffsetDateTime.now())
                    .tickets(new ArrayList<>()) // Inicializace listu
                    .build();
            carts.save(c);
        }
    }

    @Test
    void testConcurrency_AddStanding_ShouldRespectCapacity() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);

        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < THREAD_COUNT; i++) {
            final String email = "user" + i + "@test.com";

            executor.submit(() -> {
                try {
                    // Čekáme na start
                    startLatch.await();

                    // Pokus o nákup
                    CartAddItemDto dto = CartAddItemDto.builder()
                            .eventId(eventId)
                            .quantity(1)
                            .build();

                    // Zde se děje "magie" se zamykáním
                    cartService.addItem(email, dto);

                    // Pokud projde bez chyby:
                    successCount.incrementAndGet();

                } catch (Exception e) {
                    // Pokud vyhodí CapacityExceededException (nebo jinou runtime):
                    failCount.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // START! Všechna vlákna se pustí naráz
        startLatch.countDown();

        // Čekáme na dokončení
        endLatch.await();
        executor.shutdown();

        // --- VYHODNOCENÍ ---
        long ticketsInDb = tickets.count();

        System.out.println("====== VÝSLEDEK INTEGRACNIHO TESTU ======");
        System.out.println("Chtělo koupit: " + THREAD_COUNT);
        System.out.println("Kapacita: " + CAPACITY);
        System.out.println("Úspěšně: " + successCount.get());
        System.out.println("Selhalo: " + failCount.get());
        System.out.println("DB záznamů: " + ticketsInDb);
        System.out.println("=========================================");

        // Kritický test: V DB nesmí být víc lístků, než je kapacita
        assertEquals(CAPACITY, ticketsInDb, "FAIL: V DB je více lístků než kapacita! Zámek nefunguje.");
        assertEquals(CAPACITY, successCount.get());
        assertEquals(THREAD_COUNT - CAPACITY, failCount.get());
    }
}