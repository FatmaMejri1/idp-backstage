package com.stage.crm.service;

import com.stage.crm.entity.Client;
import com.stage.crm.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client("Societe Test", "20123456", "TestCorp");
    }

    @Test
    void getAllClients_shouldReturnListOfClients() {
        when(clientRepository.findAll()).thenReturn(List.of(client));

        List<Client> result = clientService.getAllClients();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Societe Test");
        verify(clientRepository, times(1)).findAll();
    }

    @Test
    void getClientById_whenClientExists_shouldReturnClient() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        Optional<Client> result = clientService.getClientById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getCompany()).isEqualTo("TestCorp");
    }

    @Test
    void getClientById_whenClientDoesNotExist_shouldReturnEmpty() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Client> result = clientService.getClientById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void createClient_shouldSaveAndReturnClient() {
        when(clientRepository.save(client)).thenReturn(client);

        Client result = clientService.createClient(client);

        assertThat(result.getName()).isEqualTo("Societe Test");
        verify(clientRepository, times(1)).save(client);
    }

    @Test
    void updateClient_whenClientExists_shouldUpdateFields() {
        Client updatedData = new Client("Nouveau Nom", "99999999", "NouvelleCorp");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        Client result = clientService.updateClient(1L, updatedData);

        assertThat(result.getName()).isEqualTo("Nouveau Nom");
        assertThat(result.getCompany()).isEqualTo("NouvelleCorp");
    }

    @Test
    void updateClient_whenClientDoesNotExist_shouldThrowException() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            clientService.updateClient(99L, client);
        });
    }

    @Test
    void deleteClient_shouldCallRepositoryDeleteById() {
        doNothing().when(clientRepository).deleteById(1L);

        clientService.deleteClient(1L);

        verify(clientRepository, times(1)).deleteById(1L);
    }
}
