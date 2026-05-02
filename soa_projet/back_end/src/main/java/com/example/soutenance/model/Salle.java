package com.example.soutenance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "salles")
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private Integer capacite;
    private String localisation;

    public Salle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Integer getCapacite() { return capacite; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }
    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }

    // "disponible" et "soutenanceActive" sont désormais calculés au niveau du contrôleur
    // car Soutenance ne contient plus de @ManyToOne vers Salle.
}