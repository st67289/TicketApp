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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.Principal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
    @Mock
    private ShortCodeStore shortCodeStore;

    @InjectMocks
    private UserService userService;

    // ========================
    // OAUTH LOGIN (NOVÉ)
    // ========================

    @Test
    void loginOAuth_Success() {
        String code = "valid-short-code";
        String email = "oauth@example.com";

        AppUser user = AppUser.builder()
                .email(email)
                .role(UserRoles.USER)
                .oauthProvider("google")
                .isEnabled(true)
                .build();

        when(shortCodeStore.consumeCode(code)).thenReturn(email);
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(email, "USER")).thenReturn("jwt-token");

        AuthResponseDto response = userService.loginOAuth(code);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("google", response.getProvider());
    }

    @Test
    void loginOAuth_NullCode_ThrowsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginOAuth(null));
        assertEquals("Code is required", ex.getMessage());
    }

    @Test
    void loginOAuth_InvalidCode_ThrowsException() {
        when(shortCodeStore.consumeCode("invalid")).thenReturn(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginOAuth("invalid"));
        assertEquals("Invalid or expired code", ex.getMessage());
    }

    @Test
    void loginOAuth_UserNotFound_ThrowsException() {
        when(shortCodeStore.consumeCode("code")).thenReturn("unknown@example.com");
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> userService.loginOAuth("code"));
    }

    @Test
    void loginOAuth_BlockedUser_ThrowsException() {
        String email = "blocked@example.com";
        AppUser user = AppUser.builder().email(email).isEnabled(false).build();

        when(shortCodeStore.consumeCode("code")).thenReturn(email);
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.loginOAuth("code"));
        assertEquals("Váš účet byl zablokován.", ex.getMessage());
    }

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
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.register(registerDto));
    }

    @Test
    void register_PasswordsDoNotMatch_ThrowsException() {
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail("test@example.com");
        registerDto.setPassword("pass1");
        registerDto.setConfirmPassword("pass2");
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.register(registerDto));
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
        when(jwtService.generateToken("test@example.com", "USER")).thenReturn("jwt-token");

        AuthResponseDto response = userService.login(loginDto);

        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("wrong@example.com");
        when(userRepository.findByEmailIgnoreCase("wrong@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.login(loginDto));
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("wrong");

        AppUser user = AppUser.builder().email("test@example.com").passwordHash("hash").isEnabled(true).build();
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.login(loginDto));
    }

    @Test
    void login_BlockedUser_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("blocked@example.com");

        AppUser user = AppUser.builder().email("blocked@example.com").passwordHash("hash").isEnabled(false).build();
        when(userRepository.findByEmailIgnoreCase("blocked@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> userService.login(loginDto));
        assertEquals("Váš účet byl zablokován.", ex.getMessage());
    }

    @Test
    void login_OAuthUser_ThrowsException() {
        LoginDto loginDto = new LoginDto();
        loginDto.setEmail("oauth@example.com");
        loginDto.setPassword("password123");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .oauthProvider("google")
                .passwordHash("dummyHash")
                .role(UserRoles.USER)
                .isEnabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.login(loginDto));

        assertTrue(ex.getMessage().contains("OAuth"));
    }

    // ========================
    // ME
    // ========================
    @Test
    void me_Success() {
        Principal principal = () -> "test@example.com";
        AppUser user = AppUser.builder().email("test@example.com").role(UserRoles.USER).build();
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));

        AuthResponseDto response = userService.me(principal);
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void me_NullPrincipal() {
        AuthResponseDto response = userService.me(null);
        assertNull(response.getEmail());
    }

    @Test
    void me_UserNotFound() {
        Principal principal = () -> "ghost@example.com";
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        AuthResponseDto response = userService.me(principal);
        assertNull(response.getEmail());
    }

    // ========================
    // REQUEST PASSWORD RESET
    // ========================
    @Test
    void requestPasswordReset_Success() {
        ForgotPasswordDto dto = new ForgotPasswordDto();
        dto.setEmail("user@example.com");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");
        user.setPasswordHash("hash");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.issueCode("user@example.com")).thenReturn("111222");

        userService.requestPasswordReset(dto);

        verify(emailService).sendResetCode("user@example.com", "111222");
    }

    @Test
    void requestPasswordReset_OAuthUser() {
        ForgotPasswordDto dto = new ForgotPasswordDto();
        dto.setEmail("oauth@example.com");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .oauthProvider("google")
                .passwordHash(null)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.requestPasswordReset(dto));
    }

    @Test
    void requestPasswordReset_UserNotFound() {
        ForgotPasswordDto dto = new ForgotPasswordDto();
        dto.setEmail("unknown@example.com");
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        userService.requestPasswordReset(dto);
        verifyNoInteractions(resetCodeStore);
    }

    // ========================
    // RESET PASSWORD
    // ========================
    @Test
    void resetPassword_Success() {
        ResetPasswordDto dto = new ResetPasswordDto();
        dto.setEmail("user@example.com");
        dto.setCode("123456");
        dto.setNewPassword("newPass");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");
        user.setPasswordHash("oldHash");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.consume("user@example.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newHash");

        userService.resetPassword(dto);

        assertEquals("newHash", user.getPasswordHash());
        verify(userRepository).save(user);
    }

    @Test
    void resetPassword_InvalidCode() {
        ResetPasswordDto dto = new ResetPasswordDto();
        dto.setEmail("user@example.com");
        dto.setCode("bad");

        AppUser user = new AppUser();
        user.setEmail("user@example.com");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(resetCodeStore.consume(anyString(), anyString())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword(dto));
    }

    @Test
    void resetPassword_OAuthUser() {
        ResetPasswordDto dto = new ResetPasswordDto();
        dto.setEmail("oauth@example.com");
        dto.setCode("123");

        AppUser user = AppUser.builder()
                .email("oauth@example.com")
                .oauthProvider("google")
                .passwordHash(null)
                .build();

        when(userRepository.findByEmailIgnoreCase("oauth@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword(dto));
    }

    // ========================
    // GET & UPDATE USER PROFILE (NOVÉ)
    // ========================

    @Test
    void getCurrentUser_Success() {
        Principal principal = () -> "user@example.com";
        AppUser user = AppUser.builder()
                .firstName("John")
                .secondName("Doe")
                .email("user@example.com")
                .role(UserRoles.USER)
                .birthDate(LocalDate.of(2000, 1, 1))
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        UserDto result = userService.getCurrentUser(principal);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("user@example.com", result.getEmail());
    }

    @Test
    void getCurrentUser_NullPrincipal_ReturnsNull() {
        assertNull(userService.getCurrentUser(null));
    }

    @Test
    void getCurrentUser_UserNotFound_ReturnsNull() {
        Principal principal = () -> "ghost@example.com";
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        assertNull(userService.getCurrentUser(principal));
    }

    @Test
    void updateCurrentUser_Success() {
        Principal principal = () -> "user@example.com";

        AppUser user = AppUser.builder()
                .firstName("OldName")
                .secondName("OldSurname")
                .email("user@example.com")
                .role(UserRoles.USER)
                .createdAt(OffsetDateTime.now())
                .build();

        UserDto updateDto = UserDto.builder()
                .firstName("NewName")
                .secondName("NewSurname")
                .birthDate(LocalDate.of(1995, 5, 5))
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        UserDto result = userService.updateCurrentUser(principal, updateDto);

        assertEquals("NewName", result.getFirstName());
        assertEquals("NewSurname", result.getSecondName());

        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(captor.capture());

        AppUser savedUser = captor.getValue();
        assertEquals("NewName", savedUser.getFirstName());
        assertEquals("NewSurname", savedUser.getSecondName());
        assertEquals(LocalDate.of(1995, 5, 5), savedUser.getBirthDate());
    }

    @Test
    void updateCurrentUser_NullPrincipal_ThrowsException() {
        UserDto dto = new UserDto();
        assertThrows(IllegalArgumentException.class, () -> userService.updateCurrentUser(null, dto));
    }

    @Test
    void updateCurrentUser_UserNotFound_ThrowsException() {
        Principal principal = () -> "ghost@example.com";
        UserDto dto = new UserDto();
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.updateCurrentUser(principal, dto));
    }

    // ========================
    // ADMIN METHODS
    // ========================
    @Test
    void setBlockedStatus_Success() {
        AppUser user = AppUser.builder().id(1L).isEnabled(true).role(UserRoles.USER).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.setBlockedStatus(1L, true);

        assertFalse(user.isEnabled());
        verify(userRepository).save(user);
    }

    @Test
    void setBlockedStatus_LastAdmin_ThrowsException() {
        AppUser admin = AppUser.builder().id(1L).isEnabled(true).role(UserRoles.ADMINISTRATOR).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.countByRole(UserRoles.ADMINISTRATOR)).thenReturn(1L);

        assertThrows(IllegalStateException.class, () -> userService.setBlockedStatus(1L, true));
    }

    @Test
    void findAllUsersForAdmin_ReturnsMappedDto() {
        AppUser user = AppUser.builder()
                .id(1L)
                .firstName("Admin")
                .secondName("User")
                .email("admin@test.com")
                .role(UserRoles.ADMINISTRATOR)
                .isEnabled(true)
                .createdAt(OffsetDateTime.now())
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        Page<AppUser> page = new PageImpl<>(List.of(user));

        when(userRepository.findAllBySearchTerm(any(), eq(pageable))).thenReturn(page);

        Page<UserAdminViewDto> result = userService.findAllUsersForAdmin("", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Admin", result.getContent().get(0).getFirstName());
        assertEquals("admin@test.com", result.getContent().get(0).getEmail());
    }
}