package com.example.soutenance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soutenances")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "creneau_id")
    private Creneau creneau;

    private String salle;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    private User etudiant;

    @ManyToOne
    @JoinColumn(name = "jury_id")
    private Jury jury;

    public Soutenance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Creneau getCreneau() { return creneau; }
    public void setCreneau(Creneau creneau) { this.creneau = creneau; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public User getEtudiant() { return etudiant; }
    public void setEtudiant(User etudiant) { this.etudiant = etudiant; }

    public Jury getJury() { return jury; }
    public void setJury(Jury jury) { this.jury = jury; }

    @Transient
    public LocalDateTime getDate() {
        return creneau != null ? creneau.getDate() : null;
    }

    @Transient
    public LocalDateTime getEndTime() {
        return (creneau != null && creneau.getDate() != null) ? creneau.getDate().plusMinutes(30) : null;
    }
}