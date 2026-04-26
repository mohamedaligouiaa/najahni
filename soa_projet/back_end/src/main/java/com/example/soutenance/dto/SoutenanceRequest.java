package com.example.soutenance.dto;

import java.time.LocalDateTime;

public class SoutenanceRequest {
    private LocalDateTime date;
    private Long salleId; // ← remplacé String salle
    private Long etudiantId;
    private Long juryId;

    public SoutenanceRequest() {}

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Long getSalleId() { return salleId; }
    public void setSalleId(Long salleId) { this.salleId = salleId; }

    public Long getEtudiantId() { return etudiantId; }
    public void setEtudiantId(Long etudiantId) { this.etudiantId = etudiantId; }

    public Long getJuryId() { return juryId; }
    public void setJuryId(Long juryId) { this.juryId = juryId; }
}