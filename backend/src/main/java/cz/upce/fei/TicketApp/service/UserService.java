package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.AuthResponseDto;
import cz.upce.fei.TicketApp.dto.LoginDto;
import cz.upce.fei.TicketApp.dto.RegisterDto;
import cz.upce.fei.TicketApp.dto.password.ForgotPasswordDto;
import cz.upce.fei.TicketApp.dto.password.ResetPasswordDto;
import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.security.JwtService;
import cz.upce.fei.TicketApp.service.passwordReset.EmailService;
import cz.upce.fei.TicketApp.service.passwordReset.ResetCodeStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResetCodeStore resetCodeStore;
    private final EmailService emailService;

    public AuthResponseDto register(RegisterDto req) {
        final String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email už existuje.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Hesla se neshodují.");
        }

        AppUser user = AppUser.builder()
                .firstName(req.getFirstName().trim())
                .secondName(req.getSecondName().trim())
                .birthDate(req.getBirthDate())
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(UserRoles.USER)
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDto(token, user.getEmail(), user.getRole(), null);
    }

    public AuthResponseDto login(LoginDto req) {
        final String email = req.getEmail().trim().toLowerCase();

        var u = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (u == null || u.getPasswordHash() == null) {
            throw new IllegalArgumentException("Nesprávný email/heslo.");
        }
        if (u.getOauthProvider() != null) {
            throw new IllegalArgumentException("Účet je připojen přes OAuth, použij Google login.");
        }
        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Nesprávný email/heslo.");
        }
        String token = jwtService.generateToken(u.getEmail(), u.getRole().name());
        return new AuthResponseDto(token, u.getEmail(), u.getRole(), null);
    }

    public AuthResponseDto me(Principal principal) {
        if (principal == null) return new AuthResponseDto(null, null, null, null);

        var u = userRepository.findByEmailIgnoreCase(principal.getName().trim().toLowerCase()).orElse(null);
        if (u == null) return new AuthResponseDto(null, null, null, null);

        return new AuthResponseDto(null, u.getEmail(), u.getRole(), u.getOauthProvider());
    }

    @Transactional
    public void requestPasswordReset(final ForgotPasswordDto req) {
        final String email = req.getEmail().trim().toLowerCase();

        userRepository.findByEmailIgnoreCase(email).ifPresent(u -> {
            if (u.getOauthProvider() != null && u.getPasswordHash() == null) {
                throw new IllegalArgumentException("Účet je připojen přes Google. Reset hesla není povolen.");
            }

            String code = resetCodeStore.issueCode(email);
            emailService.sendResetCode(email, code);
        });
    }


    @Transactional
    public void resetPassword(ResetPasswordDto req) {
        final String email = req.getEmail().trim().toLowerCase();
        final String code  = req.getCode().trim();

        var user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Neplatný kód nebo e-mail."));

        if (user.getOauthProvider() != null && user.getPasswordHash() == null) {
            throw new IllegalArgumentException("Účet je připojen přes Google. Reset hesla není povolen.");
        }

        boolean ok = resetCodeStore.consume(email, code);
        if (!ok) {
            throw new IllegalArgumentException("Neplatný nebo expirovaný kód.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

}
