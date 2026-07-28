package com.stage.crm.config;

import com.stage.crm.entity.Client;
import com.stage.crm.entity.Contact;
import com.stage.crm.entity.Opportunite;
import com.stage.crm.repository.ClientRepository;
import com.stage.crm.repository.ContactRepository;
import com.stage.crm.repository.OpportuniteRepository;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private OpportuniteRepository opportuniteRepository;

    private final Faker faker = new Faker();
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (clientRepository.count() > 0) {
            System.out.println("Donnees deja presentes, generation ignoree.");
            return;
        }

        System.out.println("Generation de donnees factices avec Faker...");

        List<Client> clients = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            Client client = new Client(
                    faker.company().name(),
                    faker.phoneNumber().phoneNumber(),
                    faker.company().name()
            );
            clients.add(clientRepository.save(client));
        }

        Opportunite.StatutOpportunite[] statuts = Opportunite.StatutOpportunite.values();

        for (Client client : clients) {
            int nbContacts = 1 + random.nextInt(3);
            for (int i = 0; i < nbContacts; i++) {
                Contact contact = new Contact(
                        faker.name().firstName(),
                        faker.name().lastName(),
                        faker.internet().emailAddress(),
                        faker.phoneNumber().phoneNumber(),
                        client
                );
                contactRepository.save(contact);
            }

            int nbOpportunites = random.nextInt(3);
            for (int i = 0; i < nbOpportunites; i++) {
                Opportunite opportunite = new Opportunite(
                        faker.commerce().productName(),
                        BigDecimal.valueOf(500 + random.nextInt(20000)),
                        statuts[random.nextInt(statuts.length)],
                        client
                );
                opportuniteRepository.save(opportunite);
            }
        }

        System.out.println("Generation terminee : " + clientRepository.count() + " clients, "
                + contactRepository.count() + " contacts, "
                + opportuniteRepository.count() + " opportunites.");
    }
}
