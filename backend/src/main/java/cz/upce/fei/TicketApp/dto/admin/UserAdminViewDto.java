package cz.upce.fei.TicketApp.dto.admin;

import cz.upce.fei.TicketApp.model.enums.UserRoles;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class UserAdminViewDto {
    private Long id;
    private String firstName;
    private String secondName;
    private String email;
    private UserRoles role;
    private String oauthProvider;
    private OffsetDateTime createdAt;
    private boolean isEnabled;
}