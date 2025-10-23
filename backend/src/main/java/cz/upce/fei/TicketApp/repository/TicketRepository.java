package cz.upce.fei.TicketApp.repository;


import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findAllByUserIdOrderByIssuedAtDesc(UUID userId);
    List<Ticket> findAllByEventId(UUID eventId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    Optional<Ticket> findByEventIdAndSeatId(UUID eventId, UUID seatId);
    boolean existsByEventIdAndSeatId(UUID eventId, UUID seatId);

    long countByEventIdAndStatus(UUID eventId, TicketStatus status);
}