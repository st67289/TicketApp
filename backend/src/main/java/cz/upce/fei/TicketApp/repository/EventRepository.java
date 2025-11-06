package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByVenueId(Long venueId);

    List<Event> findAllByStartTimeAfter(OffsetDateTime from);
    List<Event> findAllByStartTimeBetween(OffsetDateTime from, OffsetDateTime to);
}
