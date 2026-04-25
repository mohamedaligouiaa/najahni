package com.example.soutenance.controller;

import com.example.soutenance.dto.SoutenanceRequest;
import com.example.soutenance.model.Jury;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.model.User;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import com.example.soutenance.repository.UserRepository;
import com.example.soutenance.service.SoutenanceService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soutenances")
public class SoutenanceController {

    @Autowired
    private SoutenanceRepository soutenanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JuryRepository juryRepository;

    @Autowired
    private SoutenanceService soutenanceService;

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

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
        return ResponseEntity.ok(soutenanceRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SoutenanceRequest request, HttpSession session) {
        // Optionnel: Vérification du rôle Admin si nécessaire
        // User user = getAuthenticatedUser(session);
        // if (user == null || !"ADMIN".equals(user.getRole())) return ...

        try {
            Soutenance soutenance = new Soutenance();
            soutenance.setDate(request.getDate());
            soutenance.setSalle(request.getSalle());
            
            if (request.getEtudiantId() != null) {
                User etudiant = userRepository.findById(request.getEtudiantId())
                        .orElseThrow(() -> new Exception("Étudiant non trouvé"));
                soutenance.setEtudiant(etudiant);
            }

            if (request.getJuryId() != null) {
                Jury jury = juryRepository.findById(request.getJuryId())
                        .orElseThrow(() -> new Exception("Jury non trouvé"));
                soutenance.setJury(jury);
            }

            return ResponseEntity.ok(soutenanceService.saveSoutenance(soutenance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SoutenanceRequest request) {
        try {
            Soutenance soutenance = soutenanceRepository.findById(id)
                    .orElseThrow(() -> new Exception("Soutenance non trouvée"));
            
            soutenance.setDate(request.getDate());
            soutenance.setSalle(request.getSalle());

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

            return ResponseEntity.ok(soutenanceService.saveSoutenance(soutenance));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!soutenanceRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Soutenance non trouvée");
        }
        soutenanceRepository.deleteById(id);
        return ResponseEntity.ok("Soutenance supprimée avec succès");
    }
}
