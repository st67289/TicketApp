package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.model.enums.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ==== Košík / objednávka ====
    @EntityGraph(attributePaths = {"event","event.venue","seat"})
    List<Ticket> findAllByCartId(Long cartId);

    List<Ticket> findAllByEventIdAndSeatIdIn(Long eventId, Collection<Long> seatIds);

    List<Ticket> findAllByOrderId(Long orderId);

    // Pro bezpečné mazání položky jen ze svého košíku
    Optional<Ticket> findByIdAndCartUserEmail(Long id, String email);

    // ==== Event / Seat ====
    List<Ticket> findAllByEventId(Long eventId);
    Optional<Ticket> findByEventIdAndSeatId(Long eventId, Long seatId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    long countByEventIdAndSeatId(Long eventId, Long seatId);

    // Kolik lístků je v některém z daných stavů
    long countByEventIdAndStatusIn(Long eventId, Collection<TicketStatus> statuses);

    // Kolik lístků není zrušených
    long countByEventIdAndStatusNot(Long eventId, TicketStatus status);

    // Je konkrétní sedadlo pro event už zabrané?
    boolean existsByEventIdAndSeatIdAndStatusIn(Long eventId,
                                                Long seatId,
                                                Collection<TicketStatus> statuses);

    List<Ticket> findAllByEventIdAndStatusNot(Long eventId, TicketStatus status);

    // Najde všechny vstupenky uživatele, které jsou v určitých stavech (např. ISSUED)
    // Používáme EntityGraph pro efektivní načtení Eventu a Venue
    @EntityGraph(attributePaths = {"event", "event.venue", "seat"})
    List<Ticket> findAllByOrderAppUserEmailAndStatusIn(String email, Collection<TicketStatus> statuses);

    // Pro košík (pokud už tam nemáš ten EntityGraph, hodí se)
//    @EntityGraph(attributePaths = {"event", "event.venue", "seat"})
//    List<Ticket> findAllByCartId(Long cartId);
}
