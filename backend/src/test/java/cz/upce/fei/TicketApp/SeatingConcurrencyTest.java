package cz.upce.fei.TicketApp;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.exception.SeatAlreadyTakenException;
import cz.upce.fei.TicketApp.model.entity.*;
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

@SpringBootTest
@ActiveProfiles("test")
public class SeatingConcurrencyTest {

    @Autowired
    private CartService cartService;

    @Autowired private UserRepository users;
    @Autowired private EventRepository events;
    @Autowired private VenueRepository venues;
    @Autowired private SeatRepository seats; // Potřebujeme pro sezení
    @Autowired private TicketRepository tickets;
    @Autowired private CartRepository carts;

    private Long eventId;
    private Long seatId;

    // 10 lidí se popere o 1 židli
    private final int THREAD_COUNT = 10;

    @BeforeEach
    void setup() {
        // Úklid
        tickets.deleteAll();
        carts.deleteAll();
        events.deleteAll();
        seats.deleteAll(); // Smazat sedadla
        venues.deleteAll();
        users.deleteAll();

        // 1. Venue
        Venue venue = Venue.builder()
                .name("Theater")
                .address("Main St")
                .standingCapacity(0)
                .build();
        venues.save(venue);

        // 2. Vytvoříme JEDNO konkrétní sedadlo
        Seat seat = Seat.builder()
                .venue(venue)
                .seatRow("A")
                .seatNumber("1")
                .build();
        seats.save(seat);
        seatId = seat.getId();

        // 3. Event
        Event event = Event.builder()
                .name("Opera")
                .venue(venue)
                .seatingPrice(BigDecimal.valueOf(500))
                .startTime(OffsetDateTime.now().plusDays(1))
                .build();
        events.save(event);
        eventId = event.getId();

        // 4. Uživatelé
        for (int i = 0; i < THREAD_COUNT; i++) {
            AppUser u = AppUser.builder()
                    .email("viewer" + i + "@test.com")
                    .passwordHash("pass")
                    .firstName("Joe")
                    .secondName("Doe")
                    .role(UserRoles.USER)
                    .isEnabled(true)
                    .build();
            users.save(u);

            Cart c = Cart.builder()
                    .user(u)
                    .lastChanged(OffsetDateTime.now())
                    .tickets(new ArrayList<>())
                    .build();
            carts.save(c);
        }
    }

    @Test
    void testConcurrency_AddSeating_OnlyOneShouldSucceed() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(THREAD_COUNT);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger takenExceptionCount = new AtomicInteger(0);
        AtomicInteger otherExceptionCount = new AtomicInteger(0);

        for (int i = 0; i < THREAD_COUNT; i++) {
            final String email = "viewer" + i + "@test.com";

            executor.submit(() -> {
                try {
                    startLatch.await(); // Čekáme na start

                    // Všichni chtějí TO SAMÉ sedadlo (seatId) na ten samý event
                    CartAddItemDto dto = CartAddItemDto.builder()
                            .eventId(eventId)
                            .seatId(seatId)
                            .build();

                    cartService.addItem(email, dto);

                    // Pokud projde -> úspěch
                    successCount.incrementAndGet();

                } catch (SeatAlreadyTakenException e) {
                    // Očekávaná chyba pro 9 z 10 lidí
                    takenExceptionCount.incrementAndGet();
                } catch (Exception e) {
                    // Neočekávaná chyba (např. NullPointer, DB connection fail...)
                    e.printStackTrace();
                    otherExceptionCount.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        // START
        startLatch.countDown();
        endLatch.await();
        executor.shutdown();

        // --- OVĚŘENÍ ---
        long ticketsInDb = tickets.count();

        System.out.println("====== VÝSLEDEK SEATING TESTU ======");
        System.out.println("Pokusů: " + THREAD_COUNT);
        System.out.println("Úspěšně koupeno: " + successCount.get());
        System.out.println("Chyba 'SeatAlreadyTaken': " + takenExceptionCount.get());
        System.out.println("Jiné chyby: " + otherExceptionCount.get());
        System.out.println("Lístků v DB: " + ticketsInDb);
        System.out.println("====================================");

        // 1. V DB musí být právě 1 lístek (Constraint to nepustí)
        assertEquals(1, ticketsInDb, "V DB musí být pro dané sedadlo jen jeden lístek!");

        // 2. Úspěšný měl být jen 1 thread
        assertEquals(1, successCount.get(), "Jen jeden uživatel měl uspět.");

        // 3. Ostatní museli dostat SeatAlreadyTakenException
        assertEquals(THREAD_COUNT - 1, takenExceptionCount.get(), "Ostatní měli dostat informaci, že je obsazeno.");

        // 4. Žádné jiné chyby
        assertEquals(0, otherExceptionCount.get());
    }
}
