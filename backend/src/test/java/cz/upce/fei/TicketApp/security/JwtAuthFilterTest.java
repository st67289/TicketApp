package cz.upce.fei.TicketApp.security;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testDoFilter_ValidToken_SetsUserRole() throws ServletException, IOException {
        String token = "valid.jwt.token";
        String email = "user@example.com";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.parseSubject(token)).thenReturn(email);

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setRole(UserRoles.USER);

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(user));

        jwtAuthFilter.doFilter(request, response, filterChain);


        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Authentication should not be null");
        assertEquals(email, auth.getPrincipal());

        boolean hasRoleUser = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER"));
        assertTrue(hasRoleUser, "User should have authority ROLE_USER");

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilter_ValidToken_SetsAdminRole() throws ServletException, IOException {
        String token = "admin.jwt.token";
        String email = "admin@example.com";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.parseSubject(token)).thenReturn(email);

        AppUser admin = new AppUser();
        admin.setEmail(email);
        admin.setRole(UserRoles.ADMINISTRATOR);

        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(admin));


        jwtAuthFilter.doFilter(request, response, filterChain);


        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMINISTRATOR")));

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilter_NoToken_ShouldNotSetAuth() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService);
        verifyNoInteractions(userRepository);
    }

    @Test
    void testDoFilter_InvalidTokenFormat_ShouldNotSetAuth() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilter_UserNotFound_ShouldNotSetAuth() throws ServletException, IOException {
        String token = "valid.token.but.unknown.user";
        String email = "unknown@example.com";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.parseSubject(token)).thenReturn(email);
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilter_JwtException_ShouldBeIgnored() throws ServletException, IOException {
        String token = "corrupted.token";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.parseSubject(token)).thenThrow(new RuntimeException("Token expired"));

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}