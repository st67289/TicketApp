package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID>, JpaSpecificationExecutor<Event> {
    List<Event> findAllByPublishedTrue();
    List<Event> findAllByStartAtBetween(OffsetDateTime from, OffsetDateTime to);
    List<Event> findAllByHallId(UUID hallId);
}
