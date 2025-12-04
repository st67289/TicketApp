package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.event.EventCreateDto;
import cz.upce.fei.TicketApp.dto.event.EventDetailDto;
import cz.upce.fei.TicketApp.dto.event.EventFilter;
import cz.upce.fei.TicketApp.dto.event.EventListDto;
import cz.upce.fei.TicketApp.dto.event.EventUpdateDto;
import cz.upce.fei.TicketApp.service.EventService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // =================================================================
    // =========== VEŘEJNÉ ENDPOINTY PRO VŠECHNY UŽIVATELE ===========
    // =================================================================

    @Operation(summary = "Vrátí stránkovaný seznam všech akcí s možností filtrování")
    @GetMapping
    public ResponseEntity<Page<EventListDto>> list(@ParameterObject EventFilter filter,
                                                   @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(eventService.list(filter, pageable));
    }

    @Operation(summary = "Vrátí detail konkrétní akce")
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.detail(id));
    }

    @GetMapping("/{id}/occupied-seats")
    public ResponseEntity<List<Long>> getOccupiedSeats(@PathVariable Long id) {
        // Voláme logiku přesunutou do Service
        return ResponseEntity.ok(eventService.getOccupiedSeats(id));
    }

    // =================================================================
    // =========== ADMINISTRÁTORSKÉ ENDPOINTY PRO SPRÁVU AKCÍ ===========
    // =================================================================

    @Operation(summary = "Vytvoří novou akci (pouze pro administrátory)",
            description = "Tento endpoint slouží k vytvoření nové kulturní akce v systému. Vyžaduje roli ADMINISTRATOR.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping
    public ResponseEntity<EventDetailDto> create(@Valid @RequestBody EventCreateDto dto) {
        return ResponseEntity.ok(eventService.create(dto));
    }

    @Operation(summary = "Aktualizuje existující akci (pouze pro administrátory)",
            description = "Umožňuje částečnou nebo plnou aktualizaci existující akce. Vyžaduje roli ADMINISTRATOR.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PatchMapping("/{id}")
    public ResponseEntity<EventDetailDto> update(@PathVariable Long id,
                                                 @Valid @RequestBody EventUpdateDto dto) {
        return ResponseEntity.ok(eventService.update(id, dto));
    }

    @Operation(summary = "Smaže akci (pouze pro administrátory)",
            description = "Trvale smaže akci, pokud na ni nejsou vázány žádné prodané nebo rezervované vstupenky. Vyžaduje roli ADMINISTRATOR.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}