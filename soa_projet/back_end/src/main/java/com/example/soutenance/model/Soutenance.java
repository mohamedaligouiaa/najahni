package com.example.soutenance.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soutenances")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime date;

    @OneToOne
    @JoinColumn(name = "salle_id")
    @JsonIgnoreProperties("soutenanceActive")
    private Salle salle;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private User etudiant;

    @ManyToOne
    @JoinColumn(name = "jury_id")
    private Jury jury;

    public Soutenance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public Salle getSalle() { return salle; }
    public void setSalle(Salle salle) { this.salle = salle; }
    public User getEtudiant() { return etudiant; }
    public void setEtudiant(User etudiant) { this.etudiant = etudiant; }
    public Jury getJury() { return jury; }
    public void setJury(Jury jury) { this.jury = jury; }

    @Transient
    public LocalDateTime getEndTime() {
        return date != null ? date.plusMinutes(30) : null;
    }
}