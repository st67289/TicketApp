package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.AuthResponseDto;
import cz.upce.fei.TicketApp.dto.LoginDto;
import cz.upce.fei.TicketApp.dto.RegisterDto;
import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDto register(RegisterDto req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email už existuje.");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Hesla se neshodují.");
        }

        AppUser user = AppUser.builder()
                .firstName(req.getFirstName())
                .secondName(req.getSecondName())
                .birthDate(req.getBirthDate())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(UserRoles.USER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getEmail(), user.getRole(), null);
    }

    public AuthResponseDto login(LoginDto req) {
        var u = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (u == null || u.getPasswordHash() == null) {
            throw new IllegalArgumentException("Nesprávný email/heslo.");
        }
        if (u.getOauthProvider() != null) {
            throw new IllegalArgumentException("Účet je připojen přes OAuth, použij Google login.");
        }
        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Nesprávný email/heslo.");
        }

        String token = jwtService.generateToken(u.getEmail());
        return new AuthResponseDto(token, u.getEmail(), u.getRole(), null);
    }

    public AuthResponseDto me(Principal principal) {
        if (principal == null) return new AuthResponseDto(null, null, null, null);

        var u = userRepository.findByEmail(principal.getName()).orElse(null);
        if (u == null) return new AuthResponseDto(null, null, null, null);

        return new AuthResponseDto(null, u.getEmail(), u.getRole(), u.getOauthProvider());
    }
}
