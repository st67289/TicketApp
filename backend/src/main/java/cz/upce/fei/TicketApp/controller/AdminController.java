// in cz.upce.fei.TicketApp.controller.AdminController.java
package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.UserAdminViewDto;
import cz.upce.fei.TicketApp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminViewDto>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsersForAdmin());
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long id) {
        userService.setBlockedStatus(id, true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long id) {
        userService.setBlockedStatus(id, false);
        return ResponseEntity.noContent().build();
    }
}