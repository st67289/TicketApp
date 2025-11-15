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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private ResetCodeStore resetCodeStore;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    // ========================
    // REGISTER
    // ========================
    @Test
    void register_Success() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");
        registerDto.setPassword("password123");
        registerDto.setConfirmPassword("password123");
        registerDto.setFirstName("John");
        registerDto.setSecondName("Doe");
        registerDto.setBirthDate(LocalDate.of(1990, 1, 1));

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateToken("test@example.com", UserRoles.USER.name())).thenReturn("jwt-token");
        when(userRepository.save(any(AppUser.class))).thenAnswer(i -> i.getArguments()[0]);

        AuthResponseDto response = userService.register(registerDto);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(UserRoles.USER, response.getRole());
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.register(registerDto));
        assertEquals("Email už existuje.", exception.getMessage());
    }

    @Test
    void register_PasswordsDoNotMatch_ThrowsException() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");
        registerDto.setPassword("password123");
        registerDto.setConfirmPassword("password456");

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.register(registerDto));
        assertEquals("Hesla se neshodují.", exception.getMessage());
    }

    // ========================
    // LOGIN
    // ========================
    @Test
    void login_Success() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("password123");

        AppUser user = AppUser.builder()
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .role(UserRoles.USER)
                .isEnabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("test@example.com", UserRoles.USER.name())).thenReturn("jwt-token");

        AuthResponseDto response = userService.login(loginDto);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("wrong@example.com");
        loginDto.setPassword("password123");

        when(userRepository.findByEmailIgnoreCase("wrong@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.login(loginDto));
        assertEquals("Nesprávný email/heslo.", exception.getMessage());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("wrongpassword");

        AppUser user = AppUser.builder()
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .role(UserRoles.USER)
                .isEnabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.login(loginDto));
        assertEquals("Nesprávný email/heslo.", exception.getMessage());
    }

    @Test
    void login_BlockedUser_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("blocked@example.com");
        loginDto.setPassword("password123");

        AppUser user = AppUser.builder()
                .email("blocked@example.com")
                .passwordHash("encodedPassword")
                .role(UserRoles.USER)
                .isEnabled(false)
                .build();

        when(userRepository.findByEmailIgnoreCase("blocked@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.login(loginDto));
        assertEquals("Váš účet byl zablokován.", exception.getMessage());
    }

    @Test
    void login_OAuthUser_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("oauth@example.com");
        loginDto.setPassword("password123");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .passwordHash("encodedPassword")
                .oauthProvider("google")
                .role(UserRoles.USER)
                .isEnabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.login(loginDto));
        assertEquals("Účet je připojen přes OAuth, použij Google login.", exception.getMessage());
    }

    // ========================
    // ME
    // ========================
    @Test
    void me_PrincipalExists() {
        Principal principal = () -> "test@example.com";
        AppUser user = AppUser.builder()
                .email("test@example.com")
                .role(UserRoles.ADMINISTRATOR)
                .oauthProvider("google")
                .build();

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));

        AuthResponseDto response = userService.me(principal);

        assertNotNull(response);
        assertNull(response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(UserRoles.ADMINISTRATOR, response.getRole());
        assertEquals("google", response.getProvider());
    }

    @Test
    void me_PrincipalIsNull_ReturnsEmptyDto() {
        AuthResponseDto response = userService.me(null);
        assertNotNull(response);
        assertNull(response.getToken());
        assertNull(response.getEmail());
        assertNull(response.getRole());
        assertNull(response.getProvider());
    }

    @Test
    void me_UserNotFound_ReturnsEmptyDto() {
        Principal principal = () -> "nonexistent@example.com";
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        AuthResponseDto response = userService.me(principal);

        assertNotNull(response);
        assertNull(response.getToken());
        assertNull(response.getEmail());
        assertNull(response.getRole());
        assertNull(response.getProvider());
    }

    // ========================
    // REQUEST PASSWORD RESET
    // ========================
    @Test
    void requestPasswordReset_Success() {
        ForgotPasswordDto forgotDto = new ForgotPasswordDto();
        forgotDto.setEmail("user@example.com");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");
        user.setPasswordHash("somehash");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.issueCode("user@example.com")).thenReturn("123456");

        userService.requestPasswordReset(forgotDto);

        verify(emailService).sendResetCode("user@example.com", "123456");
    }

    @Test
    void requestPasswordReset_UserNotFound_DoesNothing() {
        ForgotPasswordDto forgotDto = new ForgotPasswordDto();
        forgotDto.setEmail("nonexistent@example.com");

        when(userRepository.findByEmailIgnoreCase("nonexistent@example.com")).thenReturn(Optional.empty());

        userService.requestPasswordReset(forgotDto);

        verify(emailService, never()).sendResetCode(anyString(), anyString());
    }

    @Test
    void requestPasswordReset_OAuthUser_ThrowsException() {
        ForgotPasswordDto forgotDto = new ForgotPasswordDto();
        forgotDto.setEmail("oauth@example.com");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .oauthProvider("google")
                .passwordHash(null)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.requestPasswordReset(forgotDto));
        assertEquals("Účet je připojen přes Google. Reset hesla není povolen.", exception.getMessage());
    }

    // ========================
    // RESET PASSWORD
    // ========================
    @Test
    void resetPassword_Success() {
        ResetPasswordDto resetDto = new ResetPasswordDto();
        resetDto.setEmail("user@example.com");
        resetDto.setCode("123456");
        resetDto.setNewPassword("newPassword123");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");
        user.setPasswordHash("oldHash");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.consume("user@example.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("newEncodedPassword");

        userService.resetPassword(resetDto);

        verify(userRepository).save(user);
        assertEquals("newEncodedPassword", user.getPasswordHash());
    }

    @Test
    void resetPassword_InvalidCode_ThrowsException() {
        ResetPasswordDto resetDto = new ResetPasswordDto();
        resetDto.setEmail("user@example.com");
        resetDto.setCode("wrongcode");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.consume("user@example.com", "wrongcode")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword(resetDto));
        assertEquals("Neplatný nebo expirovaný kód.", exception.getMessage());
    }

    @Test
    void resetPassword_OAuthUser_ThrowsException() {
        ResetPasswordDto resetDto = new ResetPasswordDto();
        resetDto.setEmail("oauth@example.com");
        resetDto.setCode("123456");
        resetDto.setNewPassword("newPassword");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .oauthProvider("google")
                .passwordHash(null)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword(resetDto));
        assertEquals("Účet je připojen přes Google. Reset hesla není povolen.", exception.getMessage());
    }

    // ========================
    // ADMIN METHODS
    // ========================
    @Test
    void setBlockedStatus_BlockUser_Success() {
        AppUser user = AppUser.builder()
                .id(1L)
                .isEnabled(true)
                .role(UserRoles.USER)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.setBlockedStatus(1L, true);

        assertFalse(user.isEnabled());
        verify(userRepository).save(user);
    }

    @Test
    void setBlockedStatus_BlockLastAdmin_ThrowsException() {
        AppUser admin = AppUser.builder()
                .id(1L)
                .isEnabled(true)
                .role(UserRoles.ADMINISTRATOR)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.countByRole(UserRoles.ADMINISTRATOR)).thenReturn(1L);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> userService.setBlockedStatus(1L, true));
        assertEquals("Nelze zablokovat posledního administrátora.", exception.getMessage());
    }

    @Test
    void findAllUsersForAdmin_ReturnsMappedUsers() {
        AppUser user = AppUser.builder()
                .id(1L)
                .firstName("John")
                .secondName("Doe")
                .email("test@example.com")
                .role(UserRoles.USER)
                .isEnabled(true)
                .build();
        when(userRepository.findAll()).thenReturn(List.of(user));

        var result = userService.findAllUsersForAdmin();

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
        assertEquals("Doe", result.get(0).getSecondName());
        assertEquals("test@example.com", result.get(0).getEmail());
        assertEquals(UserRoles.USER, result.get(0).getRole());
        assertTrue(result.get(0).isEnabled());
    }
}
