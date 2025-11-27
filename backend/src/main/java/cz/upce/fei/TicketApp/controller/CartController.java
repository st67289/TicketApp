package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.cart.CartAddItemDto;
import cz.upce.fei.TicketApp.dto.cart.CartDto;
import cz.upce.fei.TicketApp.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Vrátí košík přihlášeného uživatele",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<CartDto> myCart(Principal principal) {
        CartDto dto = cartService.getMyCart(principal.getName());
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Přidá položku do košíku",
            description = "STANDING: pošle {type: 'STANDING', eventId, quantity}. " +
                    "SEATING: pošle {type: 'SEATING', eventId, seatId}.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/items")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CartDto> addItem(@Valid @RequestBody CartAddItemDto body,
                                           Principal principal) {
        CartDto dto = cartService.addItem(principal.getName(), body);

        // volitelně Location na /api/carts/me, a 201 Created
        return ResponseEntity.created(URI.create("/api/carts/me")).body(dto);
    }

    @Operation(summary = "Odstraní položku z košíku (ticketId patří do tvého košíku)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/items/{ticketId}")
    public ResponseEntity<CartDto> remove(@PathVariable Long ticketId, Principal principal) {
        CartDto dto = cartService.removeItem(principal.getName(), ticketId);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/items")
    public CartDto clear(Principal p) {
        return cartService.clear(p.getName());
    }

}
