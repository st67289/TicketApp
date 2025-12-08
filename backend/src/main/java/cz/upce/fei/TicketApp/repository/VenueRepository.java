package cz.upce.fei.TicketApp.repository;

import cz.upce.fei.TicketApp.model.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByName(String name);

    @Query("SELECT v FROM Venue v WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(v.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " CAST(v.id AS string) LIKE :search)")
    Page<Venue> findAllBySearch(@Param("search") String search, Pageable pageable);
}
