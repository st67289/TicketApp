package cz.upce.fei.TicketApp.controller;

import cz.upce.fei.TicketApp.dto.user.UserDto;
import cz.upce.fei.TicketApp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDto getCurrentUser(Principal principal) {
        return userService.getCurrentUser(principal);
    }

    @PutMapping("/me")
    public UserDto updateCurrentUser(@RequestBody UserDto dto, Principal principal) {
        return userService.updateCurrentUser(principal, dto);
    }
}
