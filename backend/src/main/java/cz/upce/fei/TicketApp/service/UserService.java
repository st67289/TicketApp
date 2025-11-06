package cz.upce.fei.TicketApp.service;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import cz.upce.fei.TicketApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository users;

    public Optional<AppUser> findByEmail(String email) {
        return users.findByEmail(email);
    }

    public AppUser upsertOauthUser(String provider, String oauthId, String email) {
        return users.findByOauthProviderAndOauthId(provider, oauthId)
                .or(() -> users.findByEmail(email))
                .map(u -> { u.setOauthProvider(provider); u.setOauthId(oauthId); return users.save(u); })
                .orElseGet(() -> users.save(
                        AppUser.builder()
                                .email(email)
                                .role(UserRoles.USER)
                                .oauthProvider(provider)
                                .oauthId(oauthId)
                                .build()
                ));
    }
}

