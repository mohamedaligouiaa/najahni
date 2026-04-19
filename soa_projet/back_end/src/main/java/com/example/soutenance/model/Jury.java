package com.example.soutenance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Jury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ManyToOne
    @JoinColumn(name = "soutenance_id")
    private Soutenance soutenance;
    
    @ManyToOne
    @JoinColumn(name = "membre_id")
    private User membre;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Soutenance getSoutenance() {
		return soutenance;
	}

	public void setSoutenance(Soutenance soutenance) {
		this.soutenance = soutenance;
	}

	public User getMembre() {
		return membre;
	}

	public void setMembre(User membre) {
		this.membre = membre;
	}

    
}