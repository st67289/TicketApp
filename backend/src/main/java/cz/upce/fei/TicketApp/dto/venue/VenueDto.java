package cz.upce.fei.TicketApp.dto.venue;

import lombok.Data;

@Data
public class VenueDto {
    private Long id;
    private String name;
    private String address;
    private Integer standingCapacity;
    private Integer sittingCapacity;
    private String seatingPlanJson;
}