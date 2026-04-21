package com.example.soutenance.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "soutenance_id")
    private Soutenance soutenance;

    @ManyToOne
    @JoinColumn(name = "membre_id")
    private User membre;

    private Double note;
    private String commentaire;

    public Note() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Soutenance getSoutenance() { return soutenance; }
    public void setSoutenance(Soutenance soutenance) { this.soutenance = soutenance; }
    
    public User getMembre() { return membre; }
    public void setMembre(User membre) { this.membre = membre; }
    
    public Double getNote() { return note; }
    public void setNote(Double note) { this.note = note; }
    
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}
