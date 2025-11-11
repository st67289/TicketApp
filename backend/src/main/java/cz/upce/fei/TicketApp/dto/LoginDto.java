package cz.upce.fei.TicketApp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {

    @NotBlank(message = "Email nesmí být prázdný.")
    @Email(message = "Email musí být ve správném formátu.")
    private String email;

    @NotBlank(message = "Heslo nesmí být prázdné.")
    private String password;
}
