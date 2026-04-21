package com.example.soutenance.dto;

import java.util.List;

public class JuryRequest {
    private String nom;
    private List<JuryMemberRequest> members;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public List<JuryMemberRequest> getMembers() { return members; }
    public void setMembers(List<JuryMemberRequest> members) { this.members = members; }
}
