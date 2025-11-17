package cz.upce.fei.TicketApp.dto.user;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserDto {

    private String firstName;
    private String secondName;
    private LocalDate birthDate;
    private String email;
    private String role;
    private String createdAt;
}