package com.stage.crm.service;

import com.stage.crm.entity.Opportunite;
import com.stage.crm.repository.OpportuniteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpportuniteService {

    @Autowired
    private OpportuniteRepository opportuniteRepository;

    public List<Opportunite> getAllOpportunites() {
        return opportuniteRepository.findAll();
    }

    public Opportunite getOpportuniteById(Long id) {
        return opportuniteRepository.findById(id).orElse(null);
    }

    public Opportunite createOpportunite(Opportunite opportunite) {
        return opportuniteRepository.save(opportunite);
    }

    public Opportunite updateOpportunite(Long id, Opportunite updatedOpportunite) {
        Opportunite opportunite = opportuniteRepository.findById(id).orElse(null);
        if (opportunite == null) {
            return null;
        }
        opportunite.setTitre(updatedOpportunite.getTitre());
        opportunite.setMontant(updatedOpportunite.getMontant());
        opportunite.setStatut(updatedOpportunite.getStatut());
        opportunite.setClient(updatedOpportunite.getClient());
        return opportuniteRepository.save(opportunite);
    }

    public void deleteOpportunite(Long id) {
        opportuniteRepository.deleteById(id);
    }
}
