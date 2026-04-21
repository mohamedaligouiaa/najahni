package com.example.soutenance.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class JuryMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "jury_id")
    @JsonIgnore
    private Jury jury;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String role; // Président, Rapporteur, Encadrant

    public JuryMember() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Jury getJury() {
        return jury;
    }

    public void setJury(Jury jury) {
        this.jury = jury;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
