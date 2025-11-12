package cz.upce.fei.TicketApp.dto.password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordDto {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String code;

    @NotBlank @Size(min = 6)
    private String newPassword;
}
