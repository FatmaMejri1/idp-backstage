package com.stage.crm.service;

import com.stage.crm.entity.Client;
import com.stage.crm.entity.Opportunite;
import com.stage.crm.repository.OpportuniteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OpportuniteServiceTest {

    @Mock
    private OpportuniteRepository opportuniteRepository;

    @InjectMocks
    private OpportuniteService opportuniteService;

    private Opportunite opportunite;
    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client("Societe Test", "20123456", "TestCorp");
        opportunite = new Opportunite(
                "Contrat annuel",
                BigDecimal.valueOf(15000),
                Opportunite.StatutOpportunite.NEGOCIATION,
                client
        );
    }

    @Test
    void getAllOpportunites_shouldReturnList() {
        when(opportuniteRepository.findAll()).thenReturn(List.of(opportunite));

        List<Opportunite> result = opportuniteService.getAllOpportunites();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("Contrat annuel");
    }

    @Test
    void getOpportuniteById_whenExists_shouldReturnOpportunite() {
        when(opportuniteRepository.findById(1L)).thenReturn(Optional.of(opportunite));

        Opportunite result = opportuniteService.getOpportuniteById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getMontant()).isEqualByComparingTo(BigDecimal.valueOf(15000));
    }

    @Test
    void createOpportunite_shouldSaveAndReturn() {
        when(opportuniteRepository.save(opportunite)).thenReturn(opportunite);

        Opportunite result = opportuniteService.createOpportunite(opportunite);

        assertThat(result.getStatut()).isEqualTo(Opportunite.StatutOpportunite.NEGOCIATION);
        verify(opportuniteRepository, times(1)).save(opportunite);
    }

    @Test
    void updateOpportunite_whenExists_shouldUpdateFields() {
        Opportunite updatedData = new Opportunite(
                "Nouveau contrat", BigDecimal.valueOf(25000),
                Opportunite.StatutOpportunite.GAGNEE, client
        );
        when(opportuniteRepository.findById(1L)).thenReturn(Optional.of(opportunite));
        when(opportuniteRepository.save(any(Opportunite.class))).thenReturn(opportunite);

        Opportunite result = opportuniteService.updateOpportunite(1L, updatedData);

        assertThat(result.getTitre()).isEqualTo("Nouveau contrat");
        assertThat(result.getStatut()).isEqualTo(Opportunite.StatutOpportunite.GAGNEE);
    }

    @Test
    void updateOpportunite_whenNotExists_shouldReturnNull() {
        when(opportuniteRepository.findById(99L)).thenReturn(Optional.empty());

        Opportunite result = opportuniteService.updateOpportunite(99L, opportunite);

        assertThat(result).isNull();
    }

    @Test
    void deleteOpportunite_shouldCallRepositoryDeleteById() {
        doNothing().when(opportuniteRepository).deleteById(1L);

        opportuniteService.deleteOpportunite(1L);

        verify(opportuniteRepository, times(1)).deleteById(1L);
    }
}
