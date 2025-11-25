package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findAllByVenueId(Long venueId);

    Optional<Seat> findByVenueIdAndSeatRowAndSeatNumber(Long venueId, String seatRow, String seatNumber);

    boolean existsByVenueIdAndSeatRowAndSeatNumber(Long venueId, String seatRow, String seatNumber);

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.venue.id = :venueId")
    void deleteByVenueId(Long venueId);
}
