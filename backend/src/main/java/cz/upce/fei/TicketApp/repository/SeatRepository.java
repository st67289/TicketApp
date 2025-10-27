package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findAllByVenueIdAndIsActiveTrue(Long venueId);

    // pro konkretni misto
    Optional<Seat> findByVenueIdAndSeatRowAndSeatNumber(Long venueId, String seatRow, String seatNumber);
}
