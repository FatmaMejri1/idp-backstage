package com.stage.crm.service;

import com.stage.crm.entity.Client;
import com.stage.crm.entity.Contact;
import com.stage.crm.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private Contact contact;
    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client("Societe Test", "20123456", "TestCorp");
        contact = new Contact("Sami", "Ben Ali", "sami@test.com", "98765432", client);
    }

    @Test
    void getAllContacts_shouldReturnListOfContacts() {
        when(contactRepository.findAll()).thenReturn(List.of(contact));

        List<Contact> result = contactService.getAllContacts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("Sami");
    }

    @Test
    void getContactById_whenExists_shouldReturnContact() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));

        Contact result = contactService.getContactById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("sami@test.com");
    }

    @Test
    void getContactById_whenNotExists_shouldReturnNull() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        Contact result = contactService.getContactById(99L);

        assertThat(result).isNull();
    }

    @Test
    void createContact_shouldSaveAndReturnContact() {
        when(contactRepository.save(contact)).thenReturn(contact);

        Contact result = contactService.createContact(contact);

        assertThat(result.getLastName()).isEqualTo("Ben Ali");
        verify(contactRepository, times(1)).save(contact);
    }

    @Test
    void updateContact_whenExists_shouldUpdateFields() {
        Contact updatedData = new Contact("Ahmed", "Trabelsi", "ahmed@test.com", "11223344", client);
        when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        Contact result = contactService.updateContact(1L, updatedData);

        assertThat(result.getFirstName()).isEqualTo("Ahmed");
        assertThat(result.getEmail()).isEqualTo("ahmed@test.com");
    }

    @Test
    void updateContact_whenNotExists_shouldReturnNull() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        Contact result = contactService.updateContact(99L, contact);

        assertThat(result).isNull();
    }

    @Test
    void deleteContact_shouldCallRepositoryDeleteById() {
        doNothing().when(contactRepository).deleteById(1L);

        contactService.deleteContact(1L);

        verify(contactRepository, times(1)).deleteById(1L);
    }
}
