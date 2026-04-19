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
    @JoinColumn(name = "jury_id")
    private Jury jury;

    private Double note;
    private String commentaire;

    public Note() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Soutenance getSoutenance() { return soutenance; }
    public void setSoutenance(Soutenance soutenance) { this.soutenance = soutenance; }
    
    public Jury getJury() { return jury; }
    public void setJury(Jury jury) { this.jury = jury; }
    
    public Double getNote() { return note; }
    public void setNote(Double note) { this.note = note; }
    
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}
