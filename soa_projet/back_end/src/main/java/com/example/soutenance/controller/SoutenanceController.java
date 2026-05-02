package com.example.soutenance.controller;

import com.example.soutenance.dto.SoutenanceRequest;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.repository.SoutenanceRepository;
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
    @Autowired private SoutenanceService soutenanceService;

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
        List<Map<String, Object>> result = soutenanceRepository.findSansSalle()
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
        map.put("date", s.getDate());
        map.put("salleId", s.getSalleId());
        map.put("etudiantId", s.getEtudiantId());
        map.put("encadrantId", s.getEncadrantId());
        map.put("juryId", s.getJuryId());
        return map;
    }

    private Soutenance buildFromRequest(Soutenance soutenance, SoutenanceRequest request) {
        soutenance.setEtudiantId(request.getEtudiantId());
        soutenance.setEncadrantId(request.getEncadrantId());
        soutenance.setSalleId(request.getSalleId());
        soutenance.setJuryId(request.getJuryId());
        soutenance.setDate(request.getDate());
        return soutenance;
    }
}