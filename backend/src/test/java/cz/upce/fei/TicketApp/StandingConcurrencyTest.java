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

@ActiveProfiles("test")
@SpringBootTest
public class StandingConcurrencyTest {

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
    @Autowired
    private SeatRepository seats;

    private Long eventId;

    private final int CAPACITY = 5;
    private final int THREAD_COUNT = 10;

    @BeforeEach
    void setup() {
        tickets.deleteAll();
        carts.deleteAll();
        events.deleteAll();
        seats.deleteAll();
        venues.deleteAll();
        users.deleteAll();

        Venue venue = Venue.builder()
                .name("Test Arena")
                .standingCapacity(CAPACITY)
                .address("Test Street 1")
                .build();
        venues.save(venue);

        Event event = Event.builder()
                .name("Rock Concert")
                .venue(venue)
                .standingPrice(BigDecimal.valueOf(100))
                .startTime(OffsetDateTime.now().plusDays(1))
                .build();
        events.save(event);
        eventId = event.getId();

        for (int i = 0; i < THREAD_COUNT; i++) {
            AppUser u = AppUser.builder()
                    .email("user" + i + "@test.com")
                    .passwordHash("hashedPassword123")
                    .firstName("Test")
                    .secondName("User")
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
                    startLatch.await();

                    CartAddItemDto dto = CartAddItemDto.builder()
                            .eventId(eventId)
                            .quantity(1)
                            .build();

                    cartService.addItem(email, dto);

                    successCount.incrementAndGet();

                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown();

        endLatch.await();
        executor.shutdown();

        long ticketsInDb = tickets.count();

        System.out.println("====== VÝSLEDEK INTEGRACNIHO TESTU ======");
        System.out.println("Chtělo koupit: " + THREAD_COUNT);
        System.out.println("Kapacita: " + CAPACITY);
        System.out.println("Úspěšně: " + successCount.get());
        System.out.println("Selhalo: " + failCount.get());
        System.out.println("DB záznamů: " + ticketsInDb);
        System.out.println("=========================================");

        assertEquals(CAPACITY, ticketsInDb);
        assertEquals(CAPACITY, successCount.get());
        assertEquals(THREAD_COUNT - CAPACITY, failCount.get());
    }
}