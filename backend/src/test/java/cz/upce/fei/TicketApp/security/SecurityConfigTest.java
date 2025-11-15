package cz.upce.fei.TicketApp.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigTest {

    /**
     * jedinej integracni, zapina celej spring boot (pres application-test.properties)
     * a kontroluje, jak jsou dostupny endpointy
     */
    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicEndpointsAreAccessible() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk());
    }

    @Test
    void adminEndpointsRequireRole() throws Exception {
        mockMvc.perform(get("/api/admin/something"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminEndpointWithoutRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/test")
                        .with(user("user").roles("USER")))
                .andExpect(status().isForbidden())
                .andExpect(content().json("{\"title\":\"Zakázáno\",\"status\":403}"));
    }

}

