package cz.upce.fei.TicketApp.service.oauth2;

public interface ShortCodeStore {
    String generateCode(String email);
    String consumeCode(String code);
}
