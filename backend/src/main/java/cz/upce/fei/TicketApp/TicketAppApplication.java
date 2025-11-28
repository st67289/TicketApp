package cz.upce.fei.TicketApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EntityScan(basePackages = {"cz.upce.fei.TicketApp"})
public class TicketAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(TicketAppApplication.class, args);
	}

}
