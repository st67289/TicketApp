package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository
        extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);

    List<Event> findAllByVenueId(Long venueId);

    // Spočítat počet akcí, které teprve budou
    long countByStartTimeAfter(OffsetDateTime now);

    // Najít absolutně nejnižší cenu ze všech budoucích akcí
    // (Porovnáváme standingPrice a seatingPrice, ignorujeme NULL)
    @Query("""
        SELECT MIN(LEAST(
            COALESCE(e.standingPrice, 99999999), 
            COALESCE(e.seatingPrice, 99999999)
        )) 
        FROM Event e 
        WHERE e.startTime > :now 
          AND (e.standingPrice IS NOT NULL OR e.seatingPrice IS NOT NULL)
    """)
    BigDecimal findCheapestPriceInFuture(@Param("now") OffsetDateTime now);
}

