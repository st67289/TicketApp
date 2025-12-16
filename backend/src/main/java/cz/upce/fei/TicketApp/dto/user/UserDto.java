package cz.upce.fei.TicketApp.dto.user;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private String firstName;
    private String secondName;
    @Past(message = "Datum narození musí být v minulosti.")
    private LocalDate birthDate;
    private String email;
    private String role;
    private String createdAt;
}