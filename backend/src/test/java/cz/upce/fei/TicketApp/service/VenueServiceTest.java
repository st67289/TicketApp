package cz.upce.fei.TicketApp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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
    void create_Success() {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("Arena");
        dto.setAddress("Street 123");
        dto.setStandingCapacity(100);
        dto.setSittingCapacity(50);

        // OPRAVA: Pro tento test necháme JSON null.
        // Tím se vyhneme volání objectMapper.readValue(), který by vrátil null (protože je to mock)
        // a způsobil NullPointerException při pokusu číst řádky.
        dto.setSeatingPlanJson(null);

        // Pokud bys chtěl testovat i parsování, musel bys udělat toto (a SeatingPlan by musel být přístupný):
        // VenueService.SeatingPlan mockPlan = new VenueService.SeatingPlan();
        // mockPlan.setRows(new ArrayList<>());
        // when(objectMapper.readValue(anyString(), eq(VenueService.SeatingPlan.class))).thenReturn(mockPlan);

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

    // ========================
    // FIND ALL (S VYHLEDÁVÁNÍM A STRÁNKOVÁNÍM)
    // ========================
    @Test
    void findAll_ReturnsMappedPage() {
        // Arrange
        String searchTerm = "Arena";
        Pageable pageable = PageRequest.of(0, 10);

        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("O2 Arena");
        venue.setAddress("Prague");

        // Simulujeme, že repozitář vrátí stránku s jedním záznamem
        Page<Venue> page = new PageImpl<>(List.of(venue));

        when(venueRepository.findAllBySearch(eq(searchTerm), eq(pageable)))
                .thenReturn(page);

        // Act
        Page<VenueDto> result = venueService.findAll(searchTerm, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements()); // Celkový počet
        assertEquals(1, result.getContent().size()); // Počet na stránce

        VenueDto dto = result.getContent().get(0);
        assertEquals(1L, dto.getId());
        assertEquals("O2 Arena", dto.getName());
        assertEquals("Prague", dto.getAddress());

        // Ověření, že se volala správná metoda repozitáře
        verify(venueRepository).findAllBySearch(eq(searchTerm), eq(pageable));
    }

    @Test
    void findAll_EmptyResult() {
        // Arrange
        String searchTerm = "NonExistent";
        Pageable pageable = PageRequest.of(0, 10);

        when(venueRepository.findAllBySearch(eq(searchTerm), eq(pageable)))
                .thenReturn(Page.empty());

        // Act
        Page<VenueDto> result = venueService.findAll(searchTerm, pageable);

        // Assert
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
    }

    // ========================
    // FIND BY ID
    // ========================
    @Test
    void findById_Success() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Arena");

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        VenueDto result = venueService.findById(1L);

        assertNotNull(result);
        assertEquals("Arena", result.getName());
    }

    @Test
    void findById_NotFound_ThrowsException() {
        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.findById(1L));
        assertTrue(exception.getMessage().contains("Místo konání s ID 1 nebylo nalezeno."));
    }

    // ========================
    // UPDATE
    // ========================
    @Test
    void update_Success() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Old Arena");

        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("New Arena");

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueRepository.findByName("New Arena")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(i -> i.getArgument(0));

        VenueDto result = venueService.update(1L, dto);

        assertEquals("New Arena", result.getName());
        verify(venueRepository).save(venue);
    }

    @Test
    void update_VenueNotFound_ThrowsException() {
        VenueCreateUpdateDto dto = new VenueCreateUpdateDto();
        dto.setName("New Arena");

        when(venueRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.update(1L, dto));
        assertTrue(exception.getMessage().contains("Místo konání s ID 1 nebylo nalezeno."));
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

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> venueService.update(1L, dto));
        assertEquals("Jiný místo konání s tímto názvem již existuje.", exception.getMessage());
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
    void delete_VenueNotFound_ThrowsException() {
        when(venueRepository.existsById(1L)).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.delete(1L));
        assertTrue(exception.getMessage().contains("Místo konání s ID 1 nebylo nalezeno."));
    }

    @Test
    void delete_VenueHasEvents_ThrowsException() {
        when(venueRepository.existsById(1L)).thenReturn(true);

        Event event = mock(Event.class);
        when(eventRepository.findAllByVenueId(1L)).thenReturn(List.of(event));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> venueService.delete(1L));
        assertEquals("Nelze smazat místo konání, ke kterému jsou přiřazeny akce.", exception.getMessage());
    }

    @Test
    void findById_VenueWithEventsAndSeats_Success() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Test Venue");
        venue.setEvents(List.of(mock(Event.class), mock(Event.class)));
        venue.setSeats(List.of(mock(Seat.class), mock(Seat.class), mock(Seat.class)));

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        VenueDto dto = venueService.findById(1L);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Test Venue", dto.getName());
    }

    @Test
    void findById_AllFieldsMappedCorrectly() {
        Venue venue = new Venue();
        venue.setId(1L);
        venue.setName("Test Venue");
        venue.setAddress("Test Address");
        venue.setStandingCapacity(100);
        venue.setSittingCapacity(200);
        venue.setSeatingPlanJson("{\"layout\": \"test\"}");
        venue.setEvents(List.of(mock(Event.class)));
        venue.setSeats(List.of(mock(Seat.class)));

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        VenueDto dto = venueService.findById(1L);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Test Venue", dto.getName());
        assertEquals("Test Address", dto.getAddress());
        assertEquals(100, dto.getStandingCapacity());
        assertEquals(200, dto.getSittingCapacity());
        assertEquals("{\"layout\": \"test\"}", dto.getSeatingPlanJson());
    }
}