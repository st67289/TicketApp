package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.event.EventFilter;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class EventServiceIntegrationTest { // ta private metoda buildSpec nesla otestovat normalne tak jsem udelal integracni

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private VenueRepository venueRepo;

    private Venue venue;

    @BeforeEach
    void setup() {
        eventRepo.deleteAll();
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
}
