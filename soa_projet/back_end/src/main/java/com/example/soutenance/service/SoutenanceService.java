package com.example.soutenance.service;

import com.example.soutenance.model.Jury;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import com.example.soutenance.repository.CreneauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SoutenanceService {

    @Autowired
    private SoutenanceRepository soutenanceRepository;

    @Autowired
    private JuryRepository juryRepository;

    @Autowired
    private CreneauRepository creneauRepository;

    public Soutenance saveSoutenance(Soutenance soutenance) throws Exception {
        Long id = soutenance.getId();
        
        if (soutenance.getCreneau() == null) {
            throw new Exception("Une soutenance doit être rattachée à un créneau.");
        }

        LocalDateTime start = soutenance.getCreneau().getDate();
        LocalDateTime end = start.plusMinutes(30);

        // 1. Étudiant (si présent)
        if (soutenance.getEtudiant() != null) {
            List<Soutenance> studentExisting = soutenanceRepository.findByEtudiantId(soutenance.getEtudiant().getId());
            if (studentExisting.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
                throw new Exception("L'étudiant a déjà une soutenance programmée.");
            }
        }

        // 2. Salle (si présente)
        if (soutenance.getSalle() != null && !soutenance.getSalle().isEmpty()) {
            List<Soutenance> salleConflicts = soutenanceRepository.findOverlappingBySalle(soutenance.getSalle(), start, end);
            if (salleConflicts.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
                throw new Exception("La salle est déjà occupée.");
            }
        }

        // 3. Jury (si présent)
        if (soutenance.getJury() != null) {
            Jury jury = juryRepository.findById(soutenance.getJury().getId()).orElse(null);
            if (jury != null) {
                List<Long> userIds = jury.getMembers().stream().map(m -> m.getUser().getId()).collect(Collectors.toList());
                List<Soutenance> juryConflicts = soutenanceRepository.findOverlappingByJuryMembers(userIds, start, end);
                if (juryConflicts.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
                    throw new Exception("Conflit avec un membre du jury.");
                }
            }
        }

        return soutenanceRepository.save(soutenance);
    }
}
