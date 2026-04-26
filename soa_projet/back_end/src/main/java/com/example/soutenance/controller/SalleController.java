package com.example.soutenance.controller;

import com.example.soutenance.model.Salle;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.repository.SoutenanceRepository;
import com.example.soutenance.service.SalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salles")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SalleController {

    private final SalleService salleService;

    @Autowired
    private SoutenanceRepository soutenanceRepository;

    public SalleController(SalleService salleService) {
        this.salleService = salleService;
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getAllSalles() {
        return salleService.getAllSalles().stream().map(salle -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", salle.getId());
            map.put("nom", salle.getNom());
            map.put("capacite", salle.getCapacite());
            map.put("localisation", salle.getLocalisation());
            map.put("disponible", salle.isDisponible());

            if (salle.getSoutenanceActive() != null) {
                Soutenance s = salle.getSoutenanceActive();
                Map<String, Object> soutenanceMap = new LinkedHashMap<>();
                soutenanceMap.put("id", s.getId());
                soutenanceMap.put("date", s.getDate());
                soutenanceMap.put("dateFin", s.getDate() != null ? s.getDate().plusMinutes(30) : null);
                if (s.getEtudiant() != null) {
                    soutenanceMap.put("etudiantNom", s.getEtudiant().getNom());
                }
                map.put("soutenanceActive", soutenanceMap);
            } else {
                map.put("soutenanceActive", null);
            }
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/add")
    public ResponseEntity<?> createSalle(@RequestBody Salle salle) {
        try {
            Salle created = salleService.createSalle(salle);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", created.getId());
            map.put("nom", created.getNom());
            map.put("capacite", created.getCapacite());
            map.put("localisation", created.getLocalisation());
            map.put("disponible", true);
            map.put("soutenanceActive", null);
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSalle(@PathVariable Long id, @RequestBody Salle salle) {
        try {
            Salle updated = salleService.updateSalle(id, salle);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", updated.getId());
            map.put("nom", updated.getNom());
            map.put("capacite", updated.getCapacite());
            map.put("localisation", updated.getLocalisation());
            map.put("disponible", updated.isDisponible());
            map.put("soutenanceActive", null);
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSalle(@PathVariable Long id) {
        try {
            salleService.deleteSalle(id);
            return ResponseEntity.ok("Salle supprimée.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/liberer-terminees")
    public ResponseEntity<?> libererSallesTerminees() {
        List<Soutenance> soutenances = soutenanceRepository.findAll();
        int count = 0;
        for (Soutenance s : soutenances) {
            if (s.getSalle() != null && s.getDate() != null) {
                LocalDateTime fin = s.getDate().plusMinutes(30);
                if (LocalDateTime.now().isAfter(fin)) {
                    s.setSalle(null);
                    soutenanceRepository.save(s);
                    count++;
                }
            }
        }
        return ResponseEntity.ok(count + " salle(s) libérée(s) automatiquement.");
    }

    @PatchMapping("/{salleId}/affecter-soutenance")
    public ResponseEntity<?> affecterSoutenance(@PathVariable Long salleId, @RequestBody Map<String, Object> body) {
        try {
            Salle salle = salleService.getSalleById(salleId);
            Object soutenanceIdObj = body.get("soutenanceId");
            if (soutenanceIdObj != null) {
                Long soutenanceId = Long.valueOf(soutenanceIdObj.toString());
                Soutenance soutenance = soutenanceRepository.findById(soutenanceId).orElseThrow(() -> new Exception("Soutenance non trouvée"));
                if (!salle.isDisponible()) return ResponseEntity.badRequest().body("Cette salle est déjà occupée.");
                if (soutenance.getDate() != null) {
                    LocalDateTime start = soutenance.getDate();
                    LocalDateTime end = start.plusMinutes(30);
                    List<Soutenance> conflicts = soutenanceRepository.findOverlappingBySalle(salleId, start, end);
                    if (conflicts.stream().anyMatch(c -> !c.getId().equals(soutenanceId))) return ResponseEntity.badRequest().body("Conflit horaire : la salle est déjà occupée à ce créneau.");
                }
                soutenance.setSalle(salle);
                soutenanceRepository.save(soutenance);
                return ResponseEntity.ok("Soutenance affectée à la salle avec succès.");
            } else {
                List<Soutenance> toutes = soutenanceRepository.findAll();
                for (Soutenance s : toutes) {
                    if (s.getSalle() != null && s.getSalle().getId().equals(salleId)) {
                        s.setSalle(null);
                        soutenanceRepository.save(s);
                        break;
                    }
                }
                return ResponseEntity.ok("Affectation retirée.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}