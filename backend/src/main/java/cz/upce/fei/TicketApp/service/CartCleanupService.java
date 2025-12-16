package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.repository.CartRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class CartCleanupService {

    private final CartRepository cartRepository;

    public CartCleanupService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Scheduled(cron = "0 */3 * * * *") // Každé 3 minuty
    @Transactional
    public void removeOldCarts() {
        OffsetDateTime limit = OffsetDateTime.now().minusMinutes(30); //starší než 30 minut
        cartRepository.deleteByLastChangedBefore(limit);
    }
}
