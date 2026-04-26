package com.example.soutenance.controller;

import com.example.soutenance.dto.SoutenanceRequest;
import com.example.soutenance.model.Creneau;
import com.example.soutenance.model.Jury;
import com.example.soutenance.model.Salle;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.model.User;
import com.example.soutenance.repository.CreneauRepository;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.SalleRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import com.example.soutenance.repository.UserRepository;
import com.example.soutenance.service.SoutenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/soutenances")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"}, allowCredentials = "true")
public class SoutenanceController {

    @Autowired private SoutenanceRepository soutenanceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JuryRepository juryRepository;
    @Autowired private SalleRepository salleRepository;
    @Autowired private CreneauRepository creneauRepository;
    @Autowired private SoutenanceService soutenanceService;

    @GetMapping("/etudiants")
    public ResponseEntity<?> getEtudiants() {
        return ResponseEntity.ok(userRepository.findByRole("ETUDIANT"));
    }

    @GetMapping("/jurys")
    public ResponseEntity<?> getJurys() {
        return ResponseEntity.ok(juryRepository.findAll());
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Map<String, Object>> result = soutenanceRepository.findAll()
            .stream().map(this::soutenanceToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SoutenanceRequest request) {
        try {
            Soutenance soutenance = buildFromRequest(new Soutenance(), request);
            Soutenance saved = soutenanceService.saveSoutenance(soutenance);
            return ResponseEntity.ok(soutenanceToMap(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/sans-salle")
    public ResponseEntity<?> getSansSalle() {
        List<Map<String, Object>> result = soutenanceRepository.findSanseSalle()
            .stream().map(this::soutenanceToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SoutenanceRequest request) {
        try {
            Soutenance soutenance = soutenanceRepository.findById(id)
                    .orElseThrow(() -> new Exception("Soutenance non trouvée"));
            buildFromRequest(soutenance, request);
            Soutenance saved = soutenanceService.saveSoutenance(soutenance);
            return ResponseEntity.ok(soutenanceToMap(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            soutenanceService.deleteSoutenance(id);
            return ResponseEntity.ok("Soutenance supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Map<String, Object> soutenanceToMap(Soutenance s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("date", s.getCreneau() != null ? s.getCreneau().getDate() : null);

        if (s.getSalle() != null) {
            Map<String, Object> salleMap = new LinkedHashMap<>();
            salleMap.put("id", s.getSalle().getId());
            salleMap.put("nom", s.getSalle().getNom());
            salleMap.put("localisation", s.getSalle().getLocalisation());
            salleMap.put("capacite", s.getSalle().getCapacite());
            map.put("salle", salleMap);
        } else {
            map.put("salle", null);
        }

        if (s.getEtudiant() != null) {
            Map<String, Object> etMap = new LinkedHashMap<>();
            etMap.put("id", s.getEtudiant().getId());
            etMap.put("nom", s.getEtudiant().getNom());
            etMap.put("email", s.getEtudiant().getEmail());
            map.put("etudiant", etMap);
        } else {
            map.put("etudiant", null);
        }

        if (s.getJury() != null) {
            Map<String, Object> juryMap = new LinkedHashMap<>();
            juryMap.put("id", s.getJury().getId());
            juryMap.put("nom", s.getJury().getNom());
            map.put("jury", juryMap);
        } else {
            map.put("jury", null);
        }

        return map;
    }

    private Soutenance buildFromRequest(Soutenance soutenance, SoutenanceRequest request) throws Exception {
        if (request.getCreneauId() != null) {
            Creneau creneau = creneauRepository.findById(request.getCreneauId())
                    .orElseThrow(() -> new Exception("Créneau non trouvé"));
            soutenance.setCreneau(creneau);
        }

        if (request.getSalleId() != null) {
            Salle salle = salleRepository.findById(request.getSalleId())
                    .orElseThrow(() -> new Exception("Salle non trouvée"));
            soutenance.setSalle(salle);
        } else {
            soutenance.setSalle(null);
        }

        if (request.getEtudiantId() != null) {
            User etudiant = userRepository.findById(request.getEtudiantId())
                    .orElseThrow(() -> new Exception("Étudiant non trouvé"));
            soutenance.setEtudiant(etudiant);
        } else {
            soutenance.setEtudiant(null);
        }

        if (request.getJuryId() != null) {
            Jury jury = juryRepository.findById(request.getJuryId())
                    .orElseThrow(() -> new Exception("Jury non trouvé"));
            soutenance.setJury(jury);
        } else {
            soutenance.setJury(null);
        }

        return soutenance;
    }
}