package com.stage.crm.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.math.BigDecimal;

@Entity
public class Opportunite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    private StatutOpportunite statut;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    public enum StatutOpportunite {
        PROSPECTION,
        NEGOCIATION,
        GAGNEE,
        PERDUE
    }

    // Required by JPA
    public Opportunite() {
    }

    public Opportunite(String titre, BigDecimal montant, StatutOpportunite statut, Client client) {
        this.titre = titre;
        this.montant = montant;
        this.statut = statut;
        this.client = client;
    }

    public Long getId() {
        return id;
    }

    public String getTitre() {
        return titre;
    }

    public BigDecimal getMontant() {
        return montant;
    }

    public StatutOpportunite getStatut() {
        return statut;
    }

    public Client getClient() {
        return client;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setMontant(BigDecimal montant) {
        this.montant = montant;
    }

    public void setStatut(StatutOpportunite statut) {
        this.statut = statut;
    }

    public void setClient(Client client) {
        this.client = client;
    }
}
