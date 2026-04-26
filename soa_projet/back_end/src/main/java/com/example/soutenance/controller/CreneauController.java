package com.example.soutenance.controller;

import com.example.soutenance.model.Creneau;
import com.example.soutenance.repository.CreneauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/creneaux")
@CrossOrigin(origins = "*")
public class CreneauController {

    @Autowired
    private CreneauRepository creneauRepository;

    @GetMapping
    public List<Creneau> getAll() {
        return creneauRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Creneau creneau) {
        try {
            validateCreneau(creneau);
            return ResponseEntity.ok(creneauRepository.save(creneau));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Creneau creneauRequest) {
        try {
            Creneau creneau = creneauRepository.findById(id)
                    .orElseThrow(() -> new Exception("Créneau non trouvé"));
            
            creneau.setDate(creneauRequest.getDate());
            
            validateCreneau(creneau);
            return ResponseEntity.ok(creneauRepository.save(creneau));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        creneauRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private void validateCreneau(Creneau c) throws Exception {
        LocalDateTime start = c.getDate();
        if (start == null) throw new Exception("La date est obligatoire.");

        // 1. Date future
        if (start.toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new Exception("La date ne peut pas être dans le passé.");
        }

        // 2. Pas le dimanche
        if (start.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            throw new Exception("Les soutenances sont interdites le dimanche.");
        }

        // 3. Horaires 9h-16h
        int hour = start.getHour();
        int minute = start.getMinute();
        if (hour < 9 || hour > 15 || (hour == 15 && minute > 30)) {
            throw new Exception("Les soutenances doivent avoir lieu entre 09:00 et 16:00 (Fin max).");
        }

        // 4. Collision
        List<Creneau> conflicts = creneauRepository.findOverlapping(start.minusMinutes(29), start.plusMinutes(29));
        if (conflicts.stream().anyMatch(existing -> !existing.getId().equals(c.getId()))) {
            throw new Exception("Un créneau existe déjà sur cette plage horaire.");
        }
    }
}
