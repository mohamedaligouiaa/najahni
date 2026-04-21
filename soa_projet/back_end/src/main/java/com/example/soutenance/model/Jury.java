package com.example.soutenance.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Jury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @OneToMany(mappedBy = "jury", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JuryMember> members = new ArrayList<>();

    public Jury() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public List<JuryMember> getMembers() {
        return members;
    }

    public void setMembers(List<JuryMember> members) {
        this.members = members;
    }
}