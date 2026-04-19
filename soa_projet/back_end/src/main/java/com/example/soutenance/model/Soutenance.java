package com.example.soutenance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "soutenances")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime date;
    private String salle;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private User etudiant;

    
    @ManyToMany
    @JoinTable(
        name = "jury", 
        joinColumns = @JoinColumn(name = "soutenance_id"),
        inverseJoinColumns = @JoinColumn(name = "membre_id")
    )
    private List<User> encadrants;

    public Soutenance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public User getEtudiant() { return etudiant; }
    public void setEtudiant(User etudiant) { this.etudiant = etudiant; }

    public List<User> getEncadrants() { return encadrants; }
    public void setEncadrants(List<User> encadrants) { this.encadrants = encadrants; }
}