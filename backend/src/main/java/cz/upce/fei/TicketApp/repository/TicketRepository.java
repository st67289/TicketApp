package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ==== Košík / objednávka ====
    @EntityGraph(attributePaths = {"event","event.venue","seat"})
    List<Ticket> findAllByCartId(Long cartId);

    List<Ticket> findAllByEventIdAndSeatIdIn(Long eventId, Collection<Long> seatIds);

    // Pro bezpečné mazání položky jen ze svého košíku
    Optional<Ticket> findByIdAndCartUserEmail(Long id, String email);

    // Kolik lístků je v některém z daných stavů
    long countByEventIdAndStatusIn(Long eventId, Collection<TicketStatus> statuses);

    // Kolik lístků není zrušených
    long countByEventIdAndStatusNot(Long eventId, TicketStatus status);

    List<Ticket> findAllByEventIdAndStatusNot(Long eventId, TicketStatus status);

    // Najde všechny vstupenky uživatele, které jsou v určitých stavech (např. ISSUED)
    // Používáme EntityGraph pro efektivní načtení Eventu a Venue
    @EntityGraph(attributePaths = {"event", "event.venue", "seat"})
    List<Ticket> findAllByOrderAppUserEmailAndStatusIn(String email, Collection<TicketStatus> statuses);

    @EntityGraph(attributePaths = {"event", "event.venue", "seat"})
    Page<Ticket> findAllByOrderAppUserEmailAndStatusIn(String email, Collection<TicketStatus> statuses, Pageable pageable);

    @Query(value = """
        SELECT 
            CAST(o.created_at AS DATE) as saleDate,
            SUM(CASE WHEN t.seat_id IS NOT NULL THEN 1 ELSE 0 END) as seating,
            SUM(CASE WHEN t.seat_id IS NULL THEN 1 ELSE 0 END) as standing
        FROM tickets t
        JOIN orders o ON t.order_id = o.order_id
        WHERE t.event_id = :eventId
          AND t.status IN ('ISSUED', 'USED') -- Pouze zaplacené
        GROUP BY CAST(o.created_at AS DATE)
        ORDER BY saleDate ASC
    """, nativeQuery = true)
    List<Object[]> getSalesStatsByEventId(Long eventId);
}
