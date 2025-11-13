package cz.upce.fei.TicketApp.dto.venue;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VenueCreateUpdateDto {
    @NotBlank(message = "Název místa je povinný.")
    @Size(max = 255)
    private String name;

    @Size(max = 500)
    private String address;

    @Min(value = 0, message = "Kapacita pro stání nesmí být záporná.")
    private Integer standingCapacity;

    @Min(value = 0, message = "Kapacita pro sezení nesmí být záporná.")
    private Integer sittingCapacity;

    private String seatingPlanJson;
}