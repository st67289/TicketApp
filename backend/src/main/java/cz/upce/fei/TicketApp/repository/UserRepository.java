package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.User;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

    boolean existsByEmail(String email);

    List<User> findAllByRole(UserRoles role);
}
