// in cz.upce.fei.TicketApp.service.VenueService.java
package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.venue.VenueDto;
import cz.upce.fei.TicketApp.dto.venue.VenueCreateUpdateDto;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;

    public VenueDto create(VenueCreateUpdateDto dto) {
        if (venueRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Místo konání s tímto názvem již existuje.");
        }

        Venue venue = new Venue();
        mapDtoToEntity(dto, venue);

        Venue savedVenue = venueRepository.save(venue);
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
        venueRepository.deleteById(id);
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