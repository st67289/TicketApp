package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findAllByEventId(Long eventId);

    // aby se neprodalo dvakrát stejné místo
    Optional<Ticket> findByEventIdAndSeatId(Long eventId, Long seatId);

    boolean existsByEventIdAndSeatId(Long eventId, Long seatId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    // kolik lístků ve stavu AVAILABLE / RESERVED / SOLD pro event
    long countByEventIdAndStatus(Long eventId, TicketStatus status);
}
