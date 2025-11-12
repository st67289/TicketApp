package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // pro košík / objednávku
    List<Ticket> findAllByCartId(Long cartId);
    List<Ticket> findAllByOrderId(Long orderId);

    // pro event/seat
    List<Ticket> findAllByEventId(Long eventId);
    Optional<Ticket> findByEventIdAndSeatId(Long eventId, Long seatId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    long countByEventIdAndSeatId(Long eventId, Long seatId);

    // zabrání kapacity
    @Query("""
  select count(t) from Ticket t
  where t.event.id = :eventId
    and t.status in :statuses
""")
    long countByEventIdAndStatusIn(Long eventId, java.util.Collection<TicketStatus> statuses);

    // kolik lístků není zrušenych
    long countByEventIdAndStatusNot(Long eventId, TicketStatus status);

    // zabraná sedačka ?
    @Query("""
  select case when count(t) > 0 then true else false end
  from Ticket t
  where t.event.id = :eventId and t.seat.id = :seatId
    and t.status in :statuses
""")
    boolean existsActiveSeat(Long eventId, Long seatId, java.util.Collection<TicketStatus> statuses);

}
