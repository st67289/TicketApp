package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Order;
import cz.upce.fei.TicketApp.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByUserId(Long userId);

    List<Order> findAllByUserIdAndPaymentStatus(Long userId, OrderStatus status);
}
