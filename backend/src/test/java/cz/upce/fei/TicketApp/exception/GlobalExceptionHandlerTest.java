package cz.upce.fei.TicketApp.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ExceptionThrowingController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testHandleNotFound() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title", is("Nenalezeno")))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", is("Položka nenalezena")))
                .andExpect(jsonPath("$.type", is("https://http.dev/404")));
    }

    @Test
    void testHandleBadRequest_IllegalArgument() throws Exception {
        mockMvc.perform(get("/test/bad-request"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", is("Neplatná žádost")))
                .andExpect(jsonPath("$.detail", is("Špatný argument")));
    }

    @Test
    void testHandleCapacityExceeded() throws Exception {
        mockMvc.perform(get("/test/capacity"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title", is("Kapacita vyčerpána")))
                .andExpect(jsonPath("$.detail", is("Plno")));
    }

    @Test
    void testHandleSeatTaken() throws Exception {
        mockMvc.perform(get("/test/seat-taken"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title", is("Sedadlo již obsazeno")))
                .andExpect(jsonPath("$.detail", is("Sedadlo 12 je obsazeno")));
    }

    @Test
    void testHandleValidationErrors() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", is("Neplatná data")))
                .andExpect(jsonPath("$.detail", is("Validace selhala")))
                .andExpect(jsonPath("$.fieldErrors").exists())
                .andExpect(jsonPath("$.fieldErrors.requiredField").exists());
    }

    @Test
    void testHandleConstraintViolation() throws Exception {
        mockMvc.perform(get("/test/constraint"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", is("Neplatná data")))
                .andExpect(jsonPath("$.detail", is("Porušení omezení")));
    }

    @Test
    void testHandleAccessDenied() throws Exception {
        mockMvc.perform(get("/test/access-denied"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("Zakázáno")))
                .andExpect(jsonPath("$.detail", is("Přístup byl odepřen.")));
    }

    @Test
    void testHandleGeneralException() throws Exception {
        mockMvc.perform(get("/test/general-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.title", is("Interní chyba serveru")))
                .andExpect(jsonPath("$.detail", is("Došlo k chybě")))
                .andExpect(jsonPath("$.type", is("https://http.dev/500")));
    }

    @RestController
    @RequestMapping("/test")
    static class ExceptionThrowingController {

        @GetMapping("/not-found")
        public void throwNotFound() {
            throw new EntityNotFoundException("Položka nenalezena");
        }

        @GetMapping("/bad-request")
        public void throwBadRequest() {
            throw new IllegalArgumentException("Špatný argument");
        }

        @GetMapping("/capacity")
        public void throwCapacity() {
            throw new CapacityExceededException("Plno");
        }

        @GetMapping("/seat-taken")
        public void throwSeatTaken() {
            throw new SeatAlreadyTakenException("Sedadlo 12 je obsazeno");
        }

        @GetMapping("/constraint")
        public void throwConstraint() {
            throw new ConstraintViolationException("Porušení omezení", Set.of());
        }

        @GetMapping("/access-denied")
        public void throwAccessDenied() {
            throw new AccessDeniedException("Nemáš práva");
        }

        @GetMapping("/general-error")
        public void throwGeneral() {
            throw new RuntimeException("Něco se hodně pokazilo");
        }

        @PostMapping("/validation")
        public void validate(@Valid @RequestBody TestDto dto) {

        }
    }

    static class TestDto {
        @NotNull(message = "Nesmí být null")
        public String requiredField;
    }
}