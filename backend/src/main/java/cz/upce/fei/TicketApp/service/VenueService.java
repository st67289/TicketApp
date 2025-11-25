package cz.upce.fei.TicketApp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.upce.fei.TicketApp.dto.common.SeatDto;
import cz.upce.fei.TicketApp.dto.venue.VenueDto;
import cz.upce.fei.TicketApp.dto.venue.VenueCreateUpdateDto;
import cz.upce.fei.TicketApp.model.entity.Seat;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.SeatRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final ObjectMapper objectMapper;

    public VenueDto create(VenueCreateUpdateDto dto) {
        if (venueRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Místo konání s tímto názvem již existuje.");
        }

        Venue venue = new Venue();
        mapDtoToEntity(dto, venue);

        Venue savedVenue = venueRepository.save(venue);
        generateSeatsFromPlan(savedVenue);
        return mapEntityToDto(savedVenue);
    }

    @Transactional(readOnly = true)
    public List<VenueDto> findAll() {
        return venueRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueDto findById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Místo konání s ID " + id + " nebylo nalezeno."));
        return mapEntityToDto(venue);
    }

    public VenueDto update(Long id, VenueCreateUpdateDto dto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Místo konání s ID " + id + " nebylo nalezeno."));

        // Zkontrolujeme, jestli nový název nekoliduje s jiným místem
        venueRepository.findByName(dto.getName()).ifPresent(existingVenue -> {
            if (!existingVenue.getId().equals(id)) {
                throw new IllegalArgumentException("Jiný místo konání s tímto názvem již existuje.");
            }
        });

        mapDtoToEntity(dto, venue);
        Venue updatedVenue = venueRepository.save(venue);

        generateSeatsFromPlan(updatedVenue);

        return mapEntityToDto(updatedVenue);
    }

    public void delete(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new EntityNotFoundException("Místo konání s ID " + id + " nebylo nalezeno.");
        }
        // Zabráníme smazání, pokud se zde koná nějaká akce
        if (!eventRepository.findAllByVenueId(id).isEmpty()) {
            throw new IllegalStateException("Nelze smazat místo konání, ke kterému jsou přiřazeny akce.");
        }
        seatRepository.deleteByVenueId(id);
        venueRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByVenueId(Long venueId) {
        return seatRepository.findAllByVenueId(venueId).stream()
                .map(seat -> new SeatDto(
                        seat.getId(),
                        seat.getSeatRow(),
                        seat.getSeatNumber()
                ))
                .collect(Collectors.toList());
    }

    // --- LOGIKA GENERIVÁNÍ SEDADEL ---

    private void generateSeatsFromPlan(Venue venue) {
        String json = venue.getSeatingPlanJson();

        // 1. Smažeme stará sedadla (to je nutné při update)
        // POZOR: Pokud už existují prodané tickety na tato sedadla, DB vyhodí chybu (což je správně)
        seatRepository.deleteByVenueId(venue.getId());

        if (json == null || json.isBlank()) {
            return;
        }

        try {
            // 2. Parsujeme JSON: { "rows": [ {"label":"A", "count":10}, ... ] }
            SeatingPlan plan = objectMapper.readValue(json, SeatingPlan.class);

            if (plan.getRows() == null) return;

            List<Seat> seatsToSave = new ArrayList<>();

            // 3. Vytvoříme entity Seat
            for (SeatingPlanRow row : plan.getRows()) {
                String rowLabel = row.getLabel(); // např "A"
                int count = row.getCount();       // např 10

                for (int i = 1; i <= count; i++) {
                    Seat seat = new Seat();
                    seat.setVenue(venue);
                    seat.setSeatRow(rowLabel);
                    seat.setSeatNumber(String.valueOf(i));
                    seat.setSeatType("STANDARD"); // Abychom věděli, že to není stání

                    seatsToSave.add(seat);
                }
            }

            // 4. Uložíme hromadně
            seatRepository.saveAll(seatsToSave);

        } catch (JsonProcessingException e) {
            // Logujeme chybu, ale nevyhazujeme exception, aby se venue uložilo aspoň bez sedadel?
            // Nebo vyhodíme chybu, aby admin věděl, že má špatný JSON.
            throw new RuntimeException("Chyba při zpracování plánku sezení: " + e.getMessage(), e);
        }
    }

    // --- Pomocné DTO třídy pro parsování JSONu ---
    @Data
    public static class SeatingPlan {
        private List<SeatingPlanRow> rows;
    }

    @Data
    public static class SeatingPlanRow {
        private String label;
        private int count;
    }

    // --- Pomocné mapovací metody ---
    private VenueDto mapEntityToDto(Venue venue) {
        VenueDto dto = new VenueDto();
        dto.setId(venue.getId());
        dto.setName(venue.getName());
        dto.setAddress(venue.getAddress());
        dto.setStandingCapacity(venue.getStandingCapacity());
        dto.setSittingCapacity(venue.getSittingCapacity());
        dto.setSeatingPlanJson(venue.getSeatingPlanJson());
        return dto;
    }

    private void mapDtoToEntity(VenueCreateUpdateDto dto, Venue venue) {
        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setStandingCapacity(dto.getStandingCapacity());
        venue.setSittingCapacity(dto.getSittingCapacity());
        venue.setSeatingPlanJson(dto.getSeatingPlanJson());
    }
}