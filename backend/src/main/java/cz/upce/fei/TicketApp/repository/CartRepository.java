package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"tickets","tickets.event","tickets.event.venue","tickets.seat"})
    Optional<Cart> findByUserEmail(String email);

    void deleteByLastChangedBefore(OffsetDateTime date);
}
