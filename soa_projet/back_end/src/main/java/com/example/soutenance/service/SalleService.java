package com.example.soutenance.service;

import com.example.soutenance.model.Salle;
import com.example.soutenance.repository.SalleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SalleService {

    private final SalleRepository salleRepository;

    public SalleService(SalleRepository salleRepository) {
        this.salleRepository = salleRepository;
    }

    public List<Salle> getAllSalles() {
        return salleRepository.findAll();
    }

    // ← ajouté pour le endpoint PATCH
    public Salle getSalleById(Long id) {
        return salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable avec id : " + id));
    }

    public Salle createSalle(Salle salle) {
        return salleRepository.save(salle);
    }

    public Salle updateSalle(Long id, Salle salleDetails) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable avec id : " + id));
        salle.setNom(salleDetails.getNom());
        salle.setCapacite(salleDetails.getCapacite());
        salle.setLocalisation(salleDetails.getLocalisation());
        return salleRepository.save(salle);
    }

    public void deleteSalle(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable avec id : " + id));
        salleRepository.delete(salle);
    }
}