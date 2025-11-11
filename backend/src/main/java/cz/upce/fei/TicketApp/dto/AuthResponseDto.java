package cz.upce.fei.TicketApp.dto;

import cz.upce.fei.TicketApp.model.enums.UserRoles;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String token;      // JWT token, pokud se generuje
    private String email;      // email uživatele
    private UserRoles role;    // role uživatele
    private String provider;   // OAuth provider (null pro klasický login)
}
