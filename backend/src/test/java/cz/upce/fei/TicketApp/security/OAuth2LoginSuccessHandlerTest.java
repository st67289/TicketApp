package cz.upce.fei.TicketApp.security;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.service.oauth2.ShortCodeStore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.RedirectStrategy;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShortCodeStore shortCodeStore;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private Authentication authentication;

    @Mock
    private OAuth2User oAuth2User;

    @Mock
    private RedirectStrategy redirectStrategy;

    @InjectMocks
    private OAuth2LoginSuccessHandler successHandler;

    private final String GOOGLE_SUB = "123456789";
    private final String EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        successHandler.setRedirectStrategy(redirectStrategy);

        lenient().when(authentication.getPrincipal()).thenReturn(oAuth2User);
    }

    private void mockOAuthAttributes(boolean emailVerified) {
        Map<String, Object> attributes = Map.of(
                "sub", GOOGLE_SUB,
                "email", EMAIL,
                "email_verified", emailVerified
        );
        when(oAuth2User.getAttributes()).thenReturn(attributes);
    }

    @Test
    void testOnAuthenticationSuccess_EmailNotVerified() throws IOException {
        mockOAuthAttributes(false);

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendRedirect("/login?error=oauth_email_not_verified");

        verify(userRepository, never()).findByOauthProviderAndOauthId(any(), any());
    }

    @Test
    void testOnAuthenticationSuccess_UserAlreadyLinked() throws IOException {
        mockOAuthAttributes(true);

        AppUser existingUser = new AppUser();
        existingUser.setEmail(EMAIL);

        when(userRepository.findByOauthProviderAndOauthId("google", GOOGLE_SUB))
                .thenReturn(Optional.of(existingUser));

        when(shortCodeStore.generateCode(EMAIL)).thenReturn("short-code-123");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(userRepository, never()).save(any());
        verifySuccessRedirect("short-code-123");
    }

    @Test
    void testOnAuthenticationSuccess_UserExistsByEmail_NotLinked_ShouldLink() throws IOException {
        mockOAuthAttributes(true);

        when(userRepository.findByOauthProviderAndOauthId("google", GOOGLE_SUB))
                .thenReturn(Optional.empty());

        AppUser existingByEmail = new AppUser();
        existingByEmail.setEmail(EMAIL);
        existingByEmail.setOauthProvider(null);

        when(userRepository.findByEmailIgnoreCase(EMAIL))
                .thenReturn(Optional.of(existingByEmail));

        when(userRepository.save(any(AppUser.class))).thenAnswer(i -> i.getArguments()[0]);
        when(shortCodeStore.generateCode(EMAIL)).thenReturn("code-link");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());

        AppUser savedUser = userCaptor.getValue();
        assertEquals("google", savedUser.getOauthProvider());
        assertEquals(GOOGLE_SUB, savedUser.getOauthId());

        verifySuccessRedirect("code-link");
    }

    @Test
    void testOnAuthenticationSuccess_UserExistsByEmail_Conflict() throws IOException {
        mockOAuthAttributes(true);

        when(userRepository.findByOauthProviderAndOauthId("google", GOOGLE_SUB))
                .thenReturn(Optional.empty());

        AppUser conflictUser = new AppUser();
        conflictUser.setEmail(EMAIL);
        conflictUser.setOauthProvider("facebook");
        conflictUser.setOauthId("987654321");

        when(userRepository.findByEmailIgnoreCase(EMAIL))
                .thenReturn(Optional.of(conflictUser));

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendRedirect("/login?error=oauth_account_conflict");
        verify(userRepository, never()).save(any());
    }

    @Test
    void testOnAuthenticationSuccess_RaceCondition_SameProvider() throws IOException {
        mockOAuthAttributes(true);

        when(userRepository.findByOauthProviderAndOauthId("google", GOOGLE_SUB))
                .thenReturn(Optional.empty());

        AppUser existingUser = new AppUser();
        existingUser.setEmail(EMAIL);
        existingUser.setOauthProvider("google");
        existingUser.setOauthId(GOOGLE_SUB);

        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(existingUser));
        when(shortCodeStore.generateCode(EMAIL)).thenReturn("race-code");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verifySuccessRedirect("race-code");
    }

    @Test
    void testOnAuthenticationSuccess_NewUser() throws IOException {
        mockOAuthAttributes(true);

        when(userRepository.findByOauthProviderAndOauthId(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(anyString()))
                .thenReturn(Optional.empty());

        when(userRepository.save(any(AppUser.class))).thenAnswer(i -> i.getArguments()[0]);
        when(shortCodeStore.generateCode(EMAIL)).thenReturn("new-code");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());

        verifySuccessRedirect("new-code");
    }

    private void verifySuccessRedirect(String expectedCode) throws IOException {
        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);

        verify(redirectStrategy).sendRedirect(eq(request), eq(response), urlCaptor.capture());

        String redirectUrl = urlCaptor.getValue();
        assertNotNull(redirectUrl, "Redirect URL nesmí být null");
        assertTrue(redirectUrl.startsWith("http://localhost:5173/oauth2/callback"));
        assertTrue(redirectUrl.contains("code=" + expectedCode));
    }
}