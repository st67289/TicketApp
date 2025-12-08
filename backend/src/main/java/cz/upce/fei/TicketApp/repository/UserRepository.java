package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.AppUser;
import cz.upce.fei.TicketApp.model.enums.UserRoles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(UserRoles role);

    @Query("SELECT u FROM AppUser u WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(u.secondName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " CAST(u.id AS string) LIKE :search OR " + // Hledání podle ID
            " LOWER(u.role) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AppUser> findAllBySearchTerm(@Param("search") String search, Pageable pageable);
}
