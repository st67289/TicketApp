package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.common.VenueShortDto;
import cz.upce.fei.TicketApp.dto.event.*;
import cz.upce.fei.TicketApp.model.entity.Event;
import cz.upce.fei.TicketApp.model.entity.Venue;
import cz.upce.fei.TicketApp.model.enums.TicketStatus;
import cz.upce.fei.TicketApp.repository.EventRepository;
import cz.upce.fei.TicketApp.repository.TicketRepository;
import cz.upce.fei.TicketApp.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepo;
    private final VenueRepository venueRepo;
    private final TicketRepository ticketRepo;

    public Page<EventListDto> list(EventFilter filter, Pageable pageable) {
        Specification<Event> spec = buildSpec(filter);
        // nebo eventRepo.findAll(pageable)
        Page<Event> page = (spec == null)
                ? eventRepo.findAll(pageable)
                : eventRepo.findAll(spec, pageable);
        return page.map(this::toListDto);
    }

    public EventDetailDto detail(Long id) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
        return toDetailDto(e);
    }

    @Transactional
    public EventDetailDto create(@Valid EventCreateDto dto) {
        if (dto.getEndTime() != null && dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
        Venue venue = venueRepo.findById(dto.getVenueId())
                .orElseThrow(() -> new EntityNotFoundException("Venue not found: " + dto.getVenueId()));

        // waring když nemá místo stání nebo sezení
        if (venue.getStandingCapacity() == null || venue.getStandingCapacity() <= 0) {
            if (dto.getStandingPrice() != null)
                throw new IllegalArgumentException("Venue has no standing capacity; standingPrice not allowed");
        }
        if (venue.getSittingCapacity() == null || venue.getSittingCapacity() <= 0) {
            if (dto.getSeatingPrice() != null)
                throw new IllegalArgumentException("Venue has no seating capacity; seatingPrice not allowed");
        }

        Event e = Event.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .venue(venue)
                .standingPrice(dto.getStandingPrice())
                .seatingPrice(dto.getSeatingPrice())
                .build();

        e = eventRepo.save(e);
        return toDetailDto(e);
    }

    @Transactional
    public EventDetailDto update(Long id, @Valid EventUpdateDto dto) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));

        if (dto.getName() != null) e.setName(dto.getName());
        if (dto.getDescription() != null) e.setDescription(dto.getDescription());
        if (dto.getStartTime() != null) e.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) e.setEndTime(dto.getEndTime());

        if (dto.getVenueId() != null &&
                (e.getVenue() == null || !Objects.equals(e.getVenue().getId(), dto.getVenueId()))) {
            Venue v = venueRepo.findById(dto.getVenueId())
                    .orElseThrow(() -> new EntityNotFoundException("Venue not found: " + dto.getVenueId()));
            e.setVenue(v);
        }

        if (dto.getStandingPrice() != null) e.setStandingPrice(dto.getStandingPrice());
        if (dto.getSeatingPrice()  != null) e.setSeatingPrice(dto.getSeatingPrice());

        if (e.getEndTime() != null && e.getStartTime() != null && e.getEndTime().isBefore(e.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        return toDetailDto(e);
    }

    @Transactional
    public void delete(Long id) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
        long inUse = ticketRepo.countByEventIdAndStatusNot(id, TicketStatus.CANCELLED);
        if (inUse > 0) {
            throw new IllegalStateException("Cannot delete event with existing (non-cancelled) tickets");
        }
        eventRepo.delete(e);
    }

    private EventListDto toListDto(Event e) {
        var v = e.getVenue();
        int standingCap = i0(v.getStandingCapacity());
        int sittingCap  = i0(v.getSittingCapacity());

        boolean hasStanding = standingCap > 0;
        boolean hasSeating  = sittingCap  > 0;

        int total = (hasStanding ? standingCap : 0) + (hasSeating ? sittingCap : 0);

        long soldOrUsed = ticketRepo.countByEventIdAndStatusIn(
                e.getId(), List.of(TicketStatus.ISSUED, TicketStatus.USED, TicketStatus.RESERVED));
        int available = Math.max(total - (int) soldOrUsed, 0);

        BigDecimal fromPrice = minNonNull(e.getStandingPrice(), e.getSeatingPrice());

        return EventListDto.builder()
                .id(e.getId())
                .name(e.getName())
                .startTime(e.getStartTime())
                .venue(toVenueShort(v))
                .hasStanding(hasStanding)
                .hasSeating(hasSeating)
                .fromPrice(fromPrice)
                .standingPrice(e.getStandingPrice())
                .seatingPrice(e.getSeatingPrice())
                .available(available)
                .total(total)
                .build();
    }

    private EventDetailDto toDetailDto(Event e) {
        var v = e.getVenue();
        int standingCap = i0(v.getStandingCapacity());
        int sittingCap  = i0(v.getSittingCapacity());

        boolean hasStanding = standingCap > 0;
        boolean hasSeating  = sittingCap  > 0;

        int total = (hasStanding ? standingCap : 0) + (hasSeating ? sittingCap : 0);

        long soldOrUsed = ticketRepo.countByEventIdAndStatusIn(
                e.getId(), List.of(TicketStatus.ISSUED, TicketStatus.USED, TicketStatus.RESERVED));
        int available = Math.max(total - (int) soldOrUsed, 0);

        return EventDetailDto.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .venue(toVenueShort(v))
                .hasStanding(hasStanding)
                .hasSeating(hasSeating)
                .standingCapacity(standingCap)
                .sittingCapacity(sittingCap)
                .standingPrice(e.getStandingPrice())
                .seatingPrice(e.getSeatingPrice())
                .available(available)
                .total(total)
                .build();
    }

    private VenueShortDto toVenueShort(Venue v) {
        if (v == null) return null;
        return VenueShortDto.builder()
                .id(v.getId())
                .name(v.getName())
                .address(v.getAddress())
                .seatingPlanJson(v.getSeatingPlanJson())
                .build();
    }

    private int i0(Integer i) { return i == null ? 0 : i; }

    private BigDecimal minNonNull(BigDecimal a, BigDecimal b) {
        if (a == null) return b;
        if (b == null) return a;
        return a.min(b);
    }

    private Specification<Event> buildSpec(EventFilter f) {
        if (f == null) return null;

        return (root, q, cb) -> {
            List<Predicate> preds = new ArrayList<>();

            // explicitní LEFT JOIN na venue (jistota pro kapacity)
            var venue = root.join("venue", JoinType.LEFT);

            if (f.getVenueId() != null) {
                preds.add(cb.equal(venue.get("id"), f.getVenueId()));
            }
            if (f.getFrom() != null) {
                preds.add(cb.greaterThanOrEqualTo(root.get("startTime"), f.getFrom()));
            }
            if (f.getTo() != null) {
                preds.add(cb.lessThanOrEqualTo(root.get("startTime"), f.getTo()));
            }
            if (f.getQ() != null && !f.getQ().isBlank()) {
                String like = "%" + f.getQ().toLowerCase() + "%";
                preds.add(cb.like(cb.lower(root.get("name")), like));
            }
            if (f.getPriceMax() != null) {
                Expression<BigDecimal> sp = root.get("standingPrice");
                Expression<BigDecimal> se = root.get("seatingPrice");
                preds.add(cb.or(
                        cb.and(cb.isNotNull(sp), cb.lessThanOrEqualTo(sp, f.getPriceMax())),
                        cb.and(cb.isNotNull(se), cb.lessThanOrEqualTo(se, f.getPriceMax()))
                ));
            }
            if (Boolean.TRUE.equals(f.getHasStanding())) {
                preds.add(cb.greaterThan(venue.get("standingCapacity"), 0));
            }
            if (Boolean.TRUE.equals(f.getHasSeating())) {
                preds.add(cb.greaterThan(venue.get("sittingCapacity"), 0));
            }

            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(new Predicate[0]));
        };
    }

}
