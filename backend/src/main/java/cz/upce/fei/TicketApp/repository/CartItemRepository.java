package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findAllByCartId(Long cartId);

    // proti duplikaci lupenů
    boolean existsByCartIdAndTicketId(Long cartId, Long ticketId);
}
