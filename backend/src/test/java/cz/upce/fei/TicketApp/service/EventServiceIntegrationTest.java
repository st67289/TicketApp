package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.event.EventFilter;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Seat;
import cz.upce.fei.TicketApp.model.entity.Ticket;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.SeatRepository;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class EventServiceIntegrationTest {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private VenueRepository venueRepo;

    @Autowired
    private TicketRepository ticketRepo;

    @Autowired
    private SeatRepository seatRepo;

    private Venue venue;

    @BeforeEach
    void setup() {
        ticketRepo.deleteAll();
        eventRepo.deleteAll();
        seatRepo.deleteAll();
        venueRepo.deleteAll();

        venue = Venue.builder()
                .name("Venue A")
                .address("Address A")
                .standingCapacity(100)
                .sittingCapacity(50)
                .build();
        venue = venueRepo.save(venue);

        eventRepo.save(Event.builder()
                .name("Concert One")
                .venue(venue)
                .startTime(OffsetDateTime.now().plusDays(1))
                .standingPrice(BigDecimal.valueOf(20))
                .seatingPrice(BigDecimal.valueOf(50))
                .build());

        eventRepo.save(Event.builder()
                .name("Conference Two")
                .venue(venue)
                .startTime(OffsetDateTime.now().plusDays(3))
                .standingPrice(BigDecimal.valueOf(80))
                .seatingPrice(BigDecimal.valueOf(120))
                .build());
    }

    @Test
    void list_WithAllFilters_CoversBuildSpec() {
        EventFilter filter = new EventFilter();
        filter.setVenueId(venue.getId());
        filter.setFrom(OffsetDateTime.now());
        filter.setTo(OffsetDateTime.now().plusDays(2));
        filter.setQ("concert");
        filter.setPriceMax(BigDecimal.valueOf(30));
        filter.setHasStanding(true);
        filter.setHasSeating(true);

        Page<?> result = eventService.list(filter, PageRequest.of(0, 10));

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);

        var dto = result.getContent().get(0);
        assertThat(dto).isNotNull();
    }

    @Test
    void list_WithNullFilter_ReturnsAllEvents() {
        Page<?> result = eventService.list(null, PageRequest.of(0, 10));
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    @Transactional
    void getOccupiedSeats_ShouldReturnOnlyActiveSeatIds() {
        Event event = eventRepo.findAll().get(0);

        Seat seat1 = new Seat();
        seat1.setVenue(venue);
        seat1.setSeatRow("A");
        seat1.setSeatNumber("1");

        Seat seat2 = new Seat();
        seat2.setVenue(venue);
        seat2.setSeatRow("A");
        seat2.setSeatNumber("2");

        Seat seat3 = new Seat();
        seat3.setVenue(venue);
        seat3.setSeatRow("A");
        seat3.setSeatNumber("3");

        seatRepo.saveAll(List.of(seat1, seat2, seat3));

        Ticket t1 = new Ticket();
        t1.setEvent(event);
        t1.setSeat(seat1);
        t1.setStatus(TicketStatus.ISSUED);
        t1.setPrice(BigDecimal.TEN);
        t1.setTicketCode(UUID.randomUUID().toString());

        Ticket t2 = new Ticket();
        t2.setEvent(event);
        t2.setSeat(seat2);
        t2.setStatus(TicketStatus.CANCELLED);
        t2.setPrice(BigDecimal.TEN);
        t2.setTicketCode(UUID.randomUUID().toString());

        Ticket t3 = new Ticket();
        t3.setEvent(event);
        t3.setSeat(seat3);
        t3.setStatus(TicketStatus.RESERVED);
        t3.setPrice(BigDecimal.TEN);
        t3.setTicketCode(UUID.randomUUID().toString());

        Ticket t4 = new Ticket();
        t4.setEvent(event);
        t4.setSeat(null);
        t4.setStatus(TicketStatus.ISSUED);
        t4.setPrice(BigDecimal.TEN);
        t4.setTicketCode(UUID.randomUUID().toString());

        ticketRepo.saveAll(List.of(t1, t2, t3, t4));

        List<Long> occupiedIds = eventService.getOccupiedSeats(event.getId());

        assertThat(occupiedIds).isNotNull();
        assertThat(occupiedIds).hasSize(2);
        assertThat(occupiedIds).contains(seat1.getId(), seat3.getId());
        assertThat(occupiedIds).doesNotContain(seat2.getId());
    }
}