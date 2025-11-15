package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.event.EventCreateDto;
import cz.upce.fei.TicketApp.dto.event.EventDetailDto;
import cz.upce.fei.TicketApp.dto.event.EventListDto;
import cz.upce.fei.TicketApp.dto.event.EventUpdateDto;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private EventRepository eventRepo;
    @Mock private VenueRepository venueRepo;
    @Mock private TicketRepository ticketRepo;

    @InjectMocks private EventService eventService;

    private Venue venue;

    @BeforeEach
    void setup() {
        venue = Venue.builder()
                .id(1L)
                .name("Venue 1")
                .address("Address 1")
                .standingCapacity(100)
                .sittingCapacity(50)
                .build();
    }

    @Test
    void list_ReturnsEventListDto() {
        Event event = Event.builder()
                .id(1L)
                .name("Event 1")
                .startTime(OffsetDateTime.now())
                .venue(venue)
                .standingPrice(BigDecimal.valueOf(10))
                .seatingPrice(BigDecimal.valueOf(20))
                .build();

        Page<Event> page = new PageImpl<>(List.of(event));
        when(eventRepo.findAll(any(Pageable.class))).thenReturn(page);
        when(ticketRepo.countByEventIdAndStatusIn(anyLong(), anyList())).thenReturn(5L);

        Page<EventListDto> result = eventService.list(null, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        EventListDto dto = result.getContent().get(0);
        assertEquals("Event 1", dto.getName());
        assertTrue(dto.isHasStanding());
        assertTrue(dto.isHasSeating());
        assertEquals(100 + 50 - 5, dto.getAvailable());
    }

    @Test
    void detail_ReturnsEventDetailDto() {
        Event event = Event.builder()
                .id(1L)
                .name("Event Detail")
                .venue(venue)
                .standingPrice(BigDecimal.valueOf(10))
                .seatingPrice(BigDecimal.valueOf(20))
                .startTime(OffsetDateTime.now())
                .build();
        when(eventRepo.findById(1L)).thenReturn(Optional.of(event));
        when(ticketRepo.countByEventIdAndStatusIn(anyLong(), anyList())).thenReturn(0L);

        EventDetailDto dto = eventService.detail(1L);

        assertEquals("Event Detail", dto.getName());
        assertEquals(venue.getStandingCapacity(), dto.getStandingCapacity());
        assertEquals(venue.getSittingCapacity(), dto.getSittingCapacity());
        assertTrue(dto.isHasStanding());
        assertTrue(dto.isHasSeating());
    }

    @Test
    void create_Success() {
        EventCreateDto dto = EventCreateDto.builder()
                .name("New Event")
                .venueId(venue.getId())
                .standingPrice(BigDecimal.valueOf(10))
                .seatingPrice(BigDecimal.valueOf(20))
                .startTime(OffsetDateTime.now().plusDays(1))
                .endTime(OffsetDateTime.now().plusDays(2))
                .build();

        when(venueRepo.findById(venue.getId())).thenReturn(Optional.of(venue));

        // nastavíme ID po uložení
        when(eventRepo.save(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });

        // použití any() místo anyLong() pro null-safe
        when(ticketRepo.countByEventIdAndStatusIn(any(), anyList())).thenReturn(0L);

        EventDetailDto result = eventService.create(dto);

        assertEquals("New Event", result.getName());
        assertEquals(venue.getId(), result.getVenue().getId());
        assertTrue(result.isHasStanding());
        assertTrue(result.isHasSeating());
    }


    @Test
    void create_EndTimeBeforeStartTime_ThrowsException() {
        EventCreateDto dto = EventCreateDto.builder()
                .name("Bad Event")
                .venueId(venue.getId())
                .startTime(OffsetDateTime.now().plusDays(2))
                .endTime(OffsetDateTime.now().plusDays(1))
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> eventService.create(dto));
        assertEquals("endTime must be after startTime", ex.getMessage());
    }

    @Test
    void update_ChangesFields() {
        // připravíme původní event
        Event event = Event.builder()
                .id(1L)
                .name("Old Name")
                .venue(venue)
                .startTime(OffsetDateTime.now())
                .build();
        when(eventRepo.findById(1L)).thenReturn(Optional.of(event));

        // update DTO – měníme jen název a cenu stání
        EventUpdateDto updateDto = EventUpdateDto.builder()
                .name("Updated Name")
                .standingPrice(BigDecimal.valueOf(15))
                .build();

        EventDetailDto result = eventService.update(1L, updateDto);

        assertEquals("Updated Name", result.getName());
        assertEquals(BigDecimal.valueOf(15), result.getStandingPrice());
        assertEquals(venue.getId(), result.getVenue().getId()); // venue zůstává stejná
    }



    @Test
    void delete_NoTickets_Success() {
        Event event = Event.builder().id(1L).venue(venue).build();
        when(eventRepo.findById(1L)).thenReturn(Optional.of(event));
        when(ticketRepo.countByEventIdAndStatusNot(1L, TicketStatus.CANCELLED)).thenReturn(0L);

        assertDoesNotThrow(() -> eventService.delete(1L));
        verify(eventRepo).delete(event);
    }

    @Test
    void delete_WithTickets_ThrowsException() {
        Event event = Event.builder().id(1L).venue(venue).build();
        when(eventRepo.findById(1L)).thenReturn(Optional.of(event));
        when(ticketRepo.countByEventIdAndStatusNot(1L, TicketStatus.CANCELLED)).thenReturn(2L);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> eventService.delete(1L));
        assertEquals("Cannot delete event with existing (non-cancelled) tickets", ex.getMessage());
        verify(eventRepo, never()).delete(event);
    }
}
