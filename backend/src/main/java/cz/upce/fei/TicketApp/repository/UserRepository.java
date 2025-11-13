package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);
    boolean existsByEmailIgnoreCase(String email);
    List<AppUser> findAllByRole(UserRoles role);
}
