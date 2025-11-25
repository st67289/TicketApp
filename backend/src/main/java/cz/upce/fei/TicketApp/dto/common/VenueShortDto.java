package cz.upce.fei.TicketApp.dto.common;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VenueShortDto {
    private Long id;
    private String name;
    private String address;
    private String seatingPlanJson;
}
