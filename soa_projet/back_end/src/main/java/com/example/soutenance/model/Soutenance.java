package com.example.soutenance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soutenances")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "etudiant_id")
    private Long etudiantId;

    @Column(name = "encadrant_id")
    private Long encadrantId;

    @Column(name = "salle_id")
    private Long salleId;

    @Column(name = "jury_id")
    private Long juryId;

    @Column(name = "date")
    private LocalDateTime date;

    public Soutenance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEtudiantId() { return etudiantId; }
    public void setEtudiantId(Long etudiantId) { this.etudiantId = etudiantId; }

    public Long getEncadrantId() { return encadrantId; }
    public void setEncadrantId(Long encadrantId) { this.encadrantId = encadrantId; }

    public Long getSalleId() { return salleId; }
    public void setSalleId(Long salleId) { this.salleId = salleId; }

    public Long getJuryId() { return juryId; }
    public void setJuryId(Long juryId) { this.juryId = juryId; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    @Transient
    public LocalDateTime getEndTime() {
        return date != null ? date.plusMinutes(30) : null;
    }
}