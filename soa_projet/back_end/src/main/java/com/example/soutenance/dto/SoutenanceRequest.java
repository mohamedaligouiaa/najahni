package com.example.soutenance.dto;

import java.time.LocalDateTime;

public class SoutenanceRequest {
    private Long creneauId;
    private String salle;
    private Long etudiantId;
    private Long juryId;

    public Long getCreneauId() { return creneauId; }
    public void setCreneauId(Long creneauId) { this.creneauId = creneauId; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public Long getEtudiantId() { return etudiantId; }
    public void setEtudiantId(Long etudiantId) { this.etudiantId = etudiantId; }

    public Long getJuryId() { return juryId; }
    public void setJuryId(Long juryId) { this.juryId = juryId; }
}
