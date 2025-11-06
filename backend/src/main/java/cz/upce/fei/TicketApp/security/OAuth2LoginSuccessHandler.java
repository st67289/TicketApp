package cz.upce.fei.TicketApp.security;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository users;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth)
            throws IOException, ServletException {
        OAuth2User o = (OAuth2User) auth.getPrincipal();

        String provider = "google";
        String sub = (String) o.getAttributes().get("sub");
        String email = (String) o.getAttributes().get("email");

        // buď lokální učet nebo OAuth2
        AppUser existingByEmail = users.findByEmail(email).orElse(null);
        if (existingByEmail != null && existingByEmail.getPasswordHash() != null) {
            res.sendRedirect("/login?error=oauth_forbidden_for_local");
            return;
        }

        AppUser user = users.findByOauthProviderAndOauthId(provider, sub)
                .orElseGet(() -> existingByEmail != null ? existingByEmail : AppUser.builder()
                        .email(email)
                        .role(UserRoles.USER)
                        .build());

        user.setOauthProvider(provider);
        user.setOauthId(sub);
        users.save(user);

        String jwt = jwtService.generateToken(email);

        String redirect = UriComponentsBuilder
                .fromUriString("http://localhost:3000/oauth2/callback")
                .queryParam("token", URLEncoder.encode(jwt, StandardCharsets.UTF_8))
                .build(true).toString();

        getRedirectStrategy().sendRedirect(req, res, redirect);
    }
}
