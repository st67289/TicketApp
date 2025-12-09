package cz.upce.fei.TicketApp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.upce.fei.TicketApp.dto.common.SeatDto;
import cz.upce.fei.TicketApp.dto.venue.VenueCreateUpdateDto;
import cz.upce.fei.TicketApp.dto.venue.VenueDto;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Seat;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.SeatRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private VenueService venueService;

    // ========================
    // CREATE
    // ========================

    @Test
    void create_Success_Basic() {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("Arena");
        dto.setAddress("Street 123");
        dto.setStandingCapacity(100);
        dto.setSittingCapacity(50);
        dto.setSeatingPlanJson(null);

        when(venueRepository.findByName("Arena")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> {
            Venue v = i.getArgument(0);
            v.setId(1L);
            return v;
        });

        VenueDto result = venueService.create(dto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Arena", result.getName());
        verify(venueRepository).save(any(Venue.class));
        verify(seatRepository).deleteByVenueId(1L);
    }

    @Test
    void create_WithSeatingPlan_ShouldGenerateSeats() throws JsonProcessingException {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("Cinema");
        dto.setSeatingPlanJson("{\"rows\": [{\"label\":\"A\", \"count\":2}]}");

        VenueService.SeatingPlanRow rowA = new VenueService.SeatingPlanRow();
        rowA.setLabel("A");
        rowA.setCount(2);

        VenueService.SeatingPlan mockPlan = new VenueService.SeatingPlan();
        mockPlan.setRows(List.of(rowA));

        when(venueRepository.findByName("Cinema")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> {
            Venue v = i.getArgument(0);
            v.setId(5L);
            return v;
        });
        when(objectMapper.readValue(anyString(), eq(VenueService.SeatingPlan.class))).thenReturn(mockPlan);

        venueService.create(dto);

        verify(seatRepository).deleteByVenueId(5L);

        ArgumentCaptor<List<Seat>> seatsCaptor = ArgumentCaptor.forClass(List.class);
        verify(seatRepository).saveAll(seatsCaptor.capture());

        List<Seat> savedSeats = seatsCaptor.getValue();
        assertEquals(2, savedSeats.size());

        Seat s1 = savedSeats.get(0);
        assertEquals("A", s1.getSeatRow());
        assertEquals("1", s1.getSeatNumber());
        assertEquals(5L, s1.getVenue().getId());

        Seat s2 = savedSeats.get(1);
        assertEquals("A", s2.getSeatRow());
        assertEquals("2", s2.getSeatNumber());
    }

    @Test
    void create_WithInvalidJson_ThrowsRuntimeException() throws JsonProcessingException {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("Cinema");
        dto.setSeatingPlanJson("{invalid}");

        when(venueRepository.findByName("Cinema")).thenReturn(Optional.empty());
        when(venueRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(objectMapper.readValue(anyString(), eq(VenueService.SeatingPlan.class)))
                .thenThrow(new JsonProcessingException("Syntax error") {});

        RuntimeException ex = assertThrows(RuntimeException.class, () -> venueService.create(dto));
        assertTrue(ex.getMessage().contains("Chyba při zpracování plánku sezení"));
    }

    @Test
    void create_NameAlreadyExists_ThrowsException() {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("Arena");

        when(venueRepository.findByName("Arena")).thenReturn(Optional.of(new Venue()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> venueService.create(dto));
        assertEquals("Místo konání s tímto názvem již existuje.", exception.getMessage());
    }

    // ========================
    // FIND ALL
    // ========================

    @Test
    void findAll_ReturnsList() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Arena");

        when(venueRepository.findAll()).thenReturn(List.of(venue));

        List<VenueDto> list = venueService.findAll();

        assertEquals(1, list.size());
        assertEquals("Arena", list.get(0).getName());
    }

    @Test
    void findAll_ReturnsMappedPage() {
        String searchTerm = "Arena";
        Pageable pageable = PageRequest.of(0, 10);
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("O2 Arena");

        Page<Venue> page = new PageImpl<>(List.of(venue));

        when(venueRepository.findAllBySearch(eq(searchTerm), eq(pageable))).thenReturn(page);

        Page<VenueDto> result = venueService.findAll(searchTerm, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("O2 Arena", result.getContent().get(0).getName());
    }

    // ========================
    // FIND BY ID
    // ========================

    @Test
    void findById_Success() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Arena");
        venue.setAddress("Addr");
        venue.setStandingCapacity(100);
        venue.setSittingCapacity(50);
        venue.setSeatingPlanJson("{}");

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        VenueDto result = venueService.findById(1L);

        assertNotNull(result);
        assertEquals("Arena", result.getName());
        assertEquals(100, result.getStandingCapacity());
        assertEquals("{}", result.getSeatingPlanJson());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.findById(1L));
        assertTrue(exception.getMessage().contains("nebylo nalezeno"));
    }

    // ========================
    // UPDATE
    // ========================

    @Test
    void update_Success_Basic() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Old Arena");

        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("New Arena");
        dto.setSeatingPlanJson(null);

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueRepository.findByName("New Arena")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> i.getArgument(0));

        VenueDto result = venueService.update(1L, dto);

        assertEquals("New Arena", result.getName());
        verify(venueRepository).save(venue);
        verify(seatRepository).deleteByVenueId(1L);
    }

    @Test
    void update_WithSeatingPlan_ReplacesSeats() throws JsonProcessingException {
        Long venueId = 1L;
        Venue existingVenue = new Venue();
        existingVenue.setId(venueId);
        existingVenue.setName("OldName");

        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("NewName");
        dto.setSeatingPlanJson("{\"rows\": []}");

        VenueService.SeatingPlan emptyPlan = new VenueService.SeatingPlan();
        emptyPlan.setRows(new ArrayList<>());

        when(venueRepository.findById(venueId)).thenReturn(Optional.of(existingVenue));
        when(venueRepository.save(any())).thenReturn(existingVenue);
        when(objectMapper.readValue(anyString(), eq(VenueService.SeatingPlan.class))).thenReturn(emptyPlan);

        venueService.update(venueId, dto);

        verify(seatRepository).deleteByVenueId(venueId);
        verify(seatRepository).saveAll(anyList());
    }

    @Test
    void update_NameConflict_ThrowsException() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Old Arena");

        Venue existing = new Venue();
        existing.setId(2L);
        existing.setName("New Arena");

        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("New Arena");

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueRepository.findByName("New Arena")).thenReturn(Optional.of(existing));

        assertThrows(IllegalArgumentException.class, () -> venueService.update(1L, dto));
    }

    // ========================
    // DELETE
    // ========================

    @Test
    void delete_Success() {
        when(venueRepository.existsById(1L)).thenReturn(true);
        when(eventRepository.findAllByVenueId(1L)).thenReturn(List.of());

        venueService.delete(1L);

        verify(seatRepository).deleteByVenueId(1L);
        verify(venueRepository).deleteById(1L);
    }

    @Test
    void delete_VenueNotFound() {
        when(venueRepository.existsById(1L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> venueService.delete(1L));
    }

    @Test
    void delete_VenueHasEvents() {
        when(venueRepository.existsById(1L)).thenReturn(true);
        when(eventRepository.findAllByVenueId(1L)).thenReturn(List.of(new Event()));

        assertThrows(IllegalStateException.class, () -> venueService.delete(1L));
    }

    // ========================
    // GET SEATS BY VENUE ID
    // ========================

    @Test
    void getSeatsByVenueId_ReturnsMappedList() {
        Long venueId = 1L;
        Seat seat1 = new Seat();
        seat1.setId(10L);
        seat1.setSeatRow("A");
        seat1.setSeatNumber("1");

        Seat seat2 = new Seat();
        seat2.setId(11L);
        seat2.setSeatRow("B");
        seat2.setSeatNumber("2");

        when(seatRepository.findAllByVenueId(venueId)).thenReturn(List.of(seat1, seat2));

        List<SeatDto> result = venueService.getSeatsByVenueId(venueId);

        assertEquals(2, result.size());
        assertEquals("A", result.get(0).getSeatRow());
        assertEquals("1", result.get(0).getSeatNumber());
        assertEquals(11L, result.get(1).getId());
    }
}