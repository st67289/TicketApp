package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // pro košík / objednávku
    List<Ticket> findAllByCartId(Long cartId);
    List<Ticket> findAllByOrderId(Long orderId);

    // pro event/seat
    List<Ticket> findAllByEventId(Long eventId);
    Optional<Ticket> findByEventIdAndSeatId(Long eventId, Long seatId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    long countByEventIdAndSeatId(Long eventId, Long seatId);
}
