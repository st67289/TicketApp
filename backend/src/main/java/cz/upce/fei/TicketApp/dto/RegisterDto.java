package cz.upce.fei.TicketApp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterDto {

    @NotBlank(message = "Jméno je povinné.")
    private String firstName;

    @NotBlank(message = "Příjmení je povinné.")
    private String secondName;

    @Past(message = "Datum narození musí být v minulosti.")
    private LocalDate birthDate;

    @NotBlank(message = "Email je povinný.")
    @Email(message = "Zadejte platný formát emailu.")
    private String email;

    @NotBlank(message = "Heslo je povinné.")
    @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků.")
    private String password;

    @NotBlank(message = "Je nutné potvrdit heslo.")
    private String confirmPassword;
}
