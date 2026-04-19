package com.example.soutenance.dto;

public class NoteSubmission {
    private Long soutenanceId;
    private Double note;
    private String commentaire;

    public Long getSoutenanceId() { return soutenanceId; }
    public void setSoutenanceId(Long soutenanceId) { this.soutenanceId = soutenanceId; }

    public Double getNote() { return note; }
    public void setNote(Double note) { this.note = note; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}
