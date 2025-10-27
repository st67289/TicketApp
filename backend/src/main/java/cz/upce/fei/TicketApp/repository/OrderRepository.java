package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Order;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // historie objednávek
    List<Order> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    // idk
    List<Order> findAllByUserIdAndPaymentStatusOrderByCreatedAtDesc(Long userId, OrderStatus paymentStatus);
}
