package com.example.soutenance.controller;

import com.example.soutenance.model.Note;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.model.User;
import com.example.soutenance.repository.NoteRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/etudiant")
public class EtudiantController {

    @Autowired
    private SoutenanceRepository soutenanceRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private com.example.soutenance.repository.SalleRepository salleRepository;
    
    @Autowired
    private com.example.soutenance.repository.UserRepository userRepository;

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"ETUDIANT".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<Soutenance> soutenances = soutenanceRepository.findByEtudiantId(user.getId());
        Soutenance soutenance = soutenances.isEmpty() ? null : soutenances.get(0);
        
        Map<String, Object> response = new HashMap<>();
        
        if (soutenance != null) {
            Map<String, Object> soutenanceMap = new HashMap<>();
            soutenanceMap.put("id", soutenance.getId());
            soutenanceMap.put("date", soutenance.getDate());
            
            // Get Salle name
            if (soutenance.getSalleId() != null) {
                com.example.soutenance.model.Salle salle = salleRepository.findById(soutenance.getSalleId()).orElse(null);
                soutenanceMap.put("salle", salle != null ? salle.getNom() : "N/A");
            } else {
                soutenanceMap.put("salle", "N/A");
            }
            
            // Get Encadrant name
            if (soutenance.getEncadrantId() != null) {
                User encadrant = userRepository.findById(soutenance.getEncadrantId()).orElse(null);
                soutenanceMap.put("encadrant", encadrant != null ? encadrant.getNom() : "N/A");
            } else {
                soutenanceMap.put("encadrant", "N/A");
            }
            
            response.put("soutenance", soutenanceMap);
        } else {
            response.put("soutenance", null);
        }
        
        if (soutenance != null) {
            List<Note> notes = noteRepository.findBySoutenanceId(soutenance.getId());
            response.put("notes", notes);
            
            double sum = 0;
            for (Note n : notes) {
                sum += n.getNote();
            }
            double avg = notes.isEmpty() ? 0 : sum / notes.size();
            response.put("moyenne", avg);
            
            String mention = "Ajourné";
            if (avg >= 16) mention = "Très Bien";
            else if (avg >= 14) mention = "Bien";
            else if (avg >= 12) mention = "Assez Bien";
            else if (avg >= 10) mention = "Passable";
            
            response.put("mention", notes.isEmpty() ? "N/A" : mention);
        }

        return ResponseEntity.ok(response);
    }
}
