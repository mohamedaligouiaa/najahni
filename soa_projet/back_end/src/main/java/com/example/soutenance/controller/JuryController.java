package com.example.soutenance.controller;

import com.example.soutenance.dto.NoteSubmission;
import java.time.LocalDateTime;

import com.example.soutenance.model.Jury;
import com.example.soutenance.model.Note;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.model.User;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.NoteRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jury")
public class JuryController {

    @Autowired
    private SoutenanceRepository soutenanceRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private JuryRepository juryRepository;

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }
    
    @GetMapping("/soutenances")
    public ResponseEntity<?> getSoutenances(HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<Soutenance> soutenances = soutenanceRepository.findAll();
        return ResponseEntity.ok(soutenances);
    }
    @GetMapping("/mes-soutenance")
    public ResponseEntity<?> getMesSoutenances(HttpSession session) {
        User user = getAuthenticatedUser(session);

        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                 .body("Access denied");
        }

       

        LocalDateTime now = LocalDateTime.now();

        List<Soutenance> soutenances = soutenanceRepository.findAvailableByJury(user.getId(), LocalDateTime.now());
        return ResponseEntity.ok(soutenances);
    }
    @GetMapping("/notes/soutenance/{soutenanceId}")
    public ResponseEntity<?> getNotes(@PathVariable Long soutenanceId) {

        List<Note> notes = noteRepository.findBySoutenanceId(soutenanceId);

        return ResponseEntity.ok(notes);
    }
    @GetMapping("/moyenne/{soutenanceId}")
    public ResponseEntity<?> getMoyenne(@PathVariable Long soutenanceId) {

        List<Note> notes = noteRepository.findBySoutenanceId(soutenanceId);

        if (notes.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("moyenne", 0);
            response.put("mention", "Aucune note");
            return ResponseEntity.ok(response);
        }

        double somme = 0;

        for (Note n : notes) {
            somme += n.getNote();
        }

        double moyenne = somme / notes.size();

        String mention;

        if (moyenne < 10) {
            mention = "Redoublant";
        } else if (moyenne < 12) {
            mention = "Passable";
        } else if (moyenne < 14) {
            mention = "Assez bien";
        } else if (moyenne < 16) {
            mention = "Bien";
        } else if (moyenne < 18) {
            mention = "Très bien";
        } else {
            mention = "Excellent";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("moyenne", moyenne);
        response.put("mention", mention);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/noter")
    public ResponseEntity<?> attribuerNote(@RequestBody NoteSubmission request, HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Soutenance soutenance = soutenanceRepository.findById(request.getSoutenanceId())
                .orElse(null);
                
        if (soutenance == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Soutenance not found");
        }
        Jury jury = juryRepository.findBySoutenanceIdAndMembreId(soutenance.getId(), user.getId());
        Note note = noteRepository.findBySoutenanceIdAndJuryId(soutenance.getId(), user.getId());
        if (note == null) {
            note = new Note();
            note.setSoutenance(soutenance);
            note.setJury(jury);
        }
        
        note.setNote(request.getNote());
        note.setCommentaire(request.getCommentaire());
        noteRepository.save(note);
        
        return ResponseEntity.ok("Note attribuée avec succès");
    }
    
}
