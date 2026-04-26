package com.example.soutenance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salles")
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private Integer capacite;
    private String localisation;

    @OneToOne(mappedBy = "salle", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"salle", "etudiant", "jury"})
    private Soutenance soutenanceActive;

    public Salle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Integer getCapacite() { return capacite; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }
    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }
    public Soutenance getSoutenanceActive() { return soutenanceActive; }
    public void setSoutenanceActive(Soutenance s) { this.soutenanceActive = s; }

    @Transient
    @JsonProperty("disponible")
    public boolean isDisponible() {
        if (soutenanceActive == null) return true;

        LocalDateTime start = soutenanceActive.getDate();
        if (start == null) return true;

        LocalDateTime end = start.plusMinutes(30);
        LocalDateTime now = LocalDateTime.now();

        // ✅ corrigé : indisponible seulement pendant le créneau
        return now.isBefore(start) || now.isAfter(end);
    }
}