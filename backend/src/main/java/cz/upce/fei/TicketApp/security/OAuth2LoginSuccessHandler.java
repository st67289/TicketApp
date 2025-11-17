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
    private final ShortCodeStore shortCodeStore;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth)
            throws IOException {
        OAuth2User o = (OAuth2User) auth.getPrincipal();

        // Google claims
        String provider = "google";
        String sub = (String) o.getAttributes().get("sub");
        String email = (String) o.getAttributes().get("email");
        Object verifiedObj = o.getAttributes().get("email_verified");
        boolean emailVerified = verifiedObj instanceof Boolean ? (Boolean) verifiedObj : true; // Google většinou posílá true

        if (!emailVerified) {
            res.sendRedirect("/login?error=oauth_email_not_verified");
            return;
        }

        AppUser linked = users.findByOauthProviderAndOauthId(provider, sub).orElse(null);
        AppUser user;

        if (linked != null) {
            user = linked;
        } else {
            // Není linknutý
            AppUser existingByEmail = users.findByEmailIgnoreCase(email).orElse(null);

            if (existingByEmail != null) {
                // OAuth napojení?
                if (existingByEmail.getOauthProvider() != null && existingByEmail.getOauthId() != null) {
                    // Pokud je to stejný provider i sub je to jen race condition
                    if (provider.equals(existingByEmail.getOauthProvider())
                            && sub.equals(existingByEmail.getOauthId())) {
                        user = existingByEmail;
                    } else {
                        // Už je linknutý na něco jiného
                        res.sendRedirect("/login?error=oauth_account_conflict");
                        return;
                    }
                } else {
                    // Nemá OAuth
                    existingByEmail.setOauthProvider(provider);
                    existingByEmail.setOauthId(sub);
                    user = users.save(existingByEmail);
                }
            } else {
                // nový účet linknutý na Google
                user = AppUser.builder()
                        .email(email)
                        .role(UserRoles.USER)
                        .oauthProvider(provider)
                        .oauthId(sub)
                        .isEnabled(true)
                        //.firstName()
                        //.familyName()
                        .build();
                user = users.save(user);
            }
        }

        // Vydáme krátkodobý "short code", FE ho vymění na /api/auth/oauth/token za JWT
        String shortCode = shortCodeStore.generateCode(user.getEmail());

        String redirect = UriComponentsBuilder
                .fromUriString("http://localhost:5173/oauth2/callback")
                .queryParam("code", URLEncoder.encode(shortCode, StandardCharsets.UTF_8))
                .build(true).toString();

        getRedirectStrategy().sendRedirect(req, res, redirect);
    }
}
