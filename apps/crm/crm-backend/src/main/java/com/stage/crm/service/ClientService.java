package com.stage.crm.service;

import com.stage.crm.entity.Client;
import com.stage.crm.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;


    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }


    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }


    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }


    public Client createClient(Client client) {
        return clientRepository.save(client);
    }


    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
    
    public Client updateClient(Long id, Client updatedClient) {

         return clientRepository.findById(id)
            .map(client -> {

                client.setName(updatedClient.getName());
                client.setPhone(updatedClient.getPhone());
                client.setCompany(updatedClient.getCompany());

                return clientRepository.save(client);

            })
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
}
}
