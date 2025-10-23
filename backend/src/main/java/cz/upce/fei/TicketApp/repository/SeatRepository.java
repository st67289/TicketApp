package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {
    List<Seat> findAllByHallId(UUID hallId);

    Optional<Seat> findByHallIdAndSectionAndRowLabelAndSeatNumber(
            UUID hallId, String section, String rowLabel, String seatNumber);

    boolean existsByHallIdAndSectionAndRowLabelAndSeatNumber(
            UUID hallId, String section, String rowLabel, String seatNumber);
}