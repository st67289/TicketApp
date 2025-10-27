package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // idk no
    List<Cart> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // aktuální košík uživatele
    Optional<Cart> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
