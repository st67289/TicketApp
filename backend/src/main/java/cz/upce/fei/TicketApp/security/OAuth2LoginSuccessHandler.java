package cz.upce.fei.TicketApp.security;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import cz.upce.fei.TicketApp.service.oauth2.ShortCodeStore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository users;
    private final ShortCodeStore shortCodeStore;// nová služba pro jednorázové kódy

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth)
            throws IOException {
        OAuth2User o = (OAuth2User) auth.getPrincipal();

        String provider = "google";
        String sub = (String) o.getAttributes().get("sub");
        String email = (String) o.getAttributes().get("email");

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

        // Vygeneruj krátkodobý jednorázový kód
        String shortCode = shortCodeStore.generateCode(email);
        System.out.println("Generated short code: " + shortCode + " for email: " + email); // DEBUG

        String redirect = UriComponentsBuilder
                .fromUriString("http://localhost:5173/oauth2/callback")
                .queryParam("code", URLEncoder.encode(shortCode, StandardCharsets.UTF_8))
                .build(true).toString();

        System.out.println("Redirecting to: " + redirect); // DEBUG
        getRedirectStrategy().sendRedirect(req, res, redirect);
    }
}
