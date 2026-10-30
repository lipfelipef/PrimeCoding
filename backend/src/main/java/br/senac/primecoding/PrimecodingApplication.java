package br.senac.primecoding;

import br.senac.primecoding.services.DBService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PrimecodingApplication implements CommandLineRunner {

	@Autowired
	private DBService dbService;

	public static void main(String[] args) {
		SpringApplication.run(PrimecodingApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		dbService.instanciarDB();
	}
}
