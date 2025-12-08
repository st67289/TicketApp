package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByAppUserId(Long userId);

    Page<Order> findAllByAppUserId(Long appUserId, Pageable pageable);
}
