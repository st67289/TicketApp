package cz.upce.fei.TicketApp.dto.venue;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VenueShortDto {
    private Long id;
    private String name;
    private String address;
}
