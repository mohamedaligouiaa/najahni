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

    @ManyToOne
    @JoinColumn(name = "jury_id")
    private Jury jury;

    public Soutenance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getSalle() {
        return salle;
    }

    public void setSalle(String salle) {
        this.salle = salle;
    }

    public User getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(User etudiant) {
        this.etudiant = etudiant;
    }

    public Jury getJury() {
        return jury;
    }

    public void setJury(Jury jury) {
        this.jury = jury;
    }

    @Transient
    public LocalDateTime getEndTime() {
        return date != null ? date.plusMinutes(30) : null;
    }
}