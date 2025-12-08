package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.dto.AuthResponseDto;
import cz.upce.fei.TicketApp.dto.LoginDto;
import cz.upce.fei.TicketApp.dto.RegisterDto;
import cz.upce.fei.TicketApp.dto.admin.UserAdminViewDto;
import cz.upce.fei.TicketApp.dto.password.ForgotPasswordDto;
import cz.upce.fei.TicketApp.dto.password.ResetPasswordDto;
import cz.upce.fei.TicketApp.dto.user.UserDto;
import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.security.JwtService;
import cz.upce.fei.TicketApp.service.oauth2.ShortCodeStore;
import cz.upce.fei.TicketApp.service.passwordReset.EmailService;
import cz.upce.fei.TicketApp.service.passwordReset.ResetCodeStore;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResetCodeStore resetCodeStore;
    private final EmailService emailService;
    private final ShortCodeStore shortCodeStore;

    @Transactional
    public AuthResponseDto loginOAuth(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Code is required");
        }

        String email = shortCodeStore.consumeCode(code);

        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired code");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Volitelně: Kontrola, zda není uživatel zablokován (stejně jako u běžného loginu)
        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Váš účet byl zablokován.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        // Vracíme AuthResponseDto, což je čistší než vracet Mapu
        return new AuthResponseDto(token, user.getEmail(), user.getRole(), user.getOauthProvider());
    }

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
                .isEnabled(true)
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
        if (!u.isEnabled()) {
            throw new IllegalArgumentException("Váš účet byl zablokován.");
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

    // ======================================================
    // METODY PRO ADMINISTRACI
    // ======================================================

    @Transactional(readOnly = true)
    public Page<UserAdminViewDto> findAllUsersForAdmin(String search, Pageable pageable) {
        return userRepository.findAllBySearchTerm(search, pageable)
                .map(this::mapToUserAdminViewDto);
    }

    @Transactional
    public void setBlockedStatus(Long userId, boolean blocked) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Uživatel s ID " + userId + " nenalezen."));

        // Zabráníme zablokování posledního administrátora
        if (blocked && user.getRole() == UserRoles.ADMINISTRATOR) {
            if (userRepository.countByRole(UserRoles.ADMINISTRATOR) <= 1) {
                throw new IllegalStateException("Nelze zablokovat posledního administrátora.");
            }
        }

        user.setEnabled(!blocked); // isEnabled = true (není blokován), isEnabled = false (je blokován)
        userRepository.save(user);
    }

    private UserAdminViewDto mapToUserAdminViewDto(AppUser user) {
        UserAdminViewDto dto = new UserAdminViewDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setSecondName(user.getSecondName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setOauthProvider(user.getOauthProvider());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setEnabled(user.isEnabled());
        return dto;
    }

    //metody pro zobrazení a změnu profilu
    public UserDto getCurrentUser(Principal principal) {
        if (principal == null) return null;

        var u = userRepository.findByEmailIgnoreCase(principal.getName().trim().toLowerCase())
                .orElse(null);
        if (u == null) return null;

        return UserDto.builder()
                .firstName(u.getFirstName())
                .secondName(u.getSecondName())
                .birthDate(u.getBirthDate())
                .email(u.getEmail())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt().toString())
                .build();
    }

    @Transactional
    public UserDto updateCurrentUser(Principal principal, UserDto dto) {
        if (principal == null) throw new IllegalArgumentException("Neautorizovaný uživatel");

        var user = userRepository.findByEmailIgnoreCase(principal.getName().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Uživatel nenalezen"));

        user.setFirstName(dto.getFirstName());
        user.setSecondName(dto.getSecondName());
        user.setBirthDate(dto.getBirthDate());

        userRepository.save(user);

        return UserDto.builder()
                .firstName(user.getFirstName())
                .secondName(user.getSecondName())
                .birthDate(user.getBirthDate())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt().toString())
                .build();
    }

}
