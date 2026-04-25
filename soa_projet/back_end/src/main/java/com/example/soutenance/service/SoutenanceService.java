package com.example.soutenance.service;

import com.example.soutenance.model.Jury;
import com.example.soutenance.model.JuryMember;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.SoutenanceRepository;
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

    public Soutenance saveSoutenance(Soutenance soutenance) throws Exception {
        Long id = soutenance.getId();
        LocalDateTime start = soutenance.getDate();

        if (start == null) {
            return soutenanceRepository.save(soutenance);
        }

        // 1. Validation de la date
        if (start.toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new Exception("La date ne peut pas être dans le passé.");
        }
        
        if (start.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            throw new Exception("Les soutenances sont interdites le Dimanche.");
        }

        // 2. Validation de l'heure
        int hour = start.getHour();
        int minute = start.getMinute();
        
        if (hour < 9) {
            throw new Exception("La première soutenance doit commencer à 09:00.");
        }
        
        if (hour > 15 || (hour == 15 && minute > 30)) {
            throw new Exception("La dernière soutenance doit être terminée à 16:00 (Dernier début à 15:30).");
        }

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
