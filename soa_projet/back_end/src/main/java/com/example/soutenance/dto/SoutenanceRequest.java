package com.example.soutenance.dto;

import java.time.LocalDateTime;

public class SoutenanceRequest {
    private Long etudiantId;
    private Long encadrantId;
    private Long salleId;
    private Long juryId;
    private LocalDateTime date;

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
}