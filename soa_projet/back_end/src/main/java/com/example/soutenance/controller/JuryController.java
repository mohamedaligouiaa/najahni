package com.example.soutenance.controller;

import com.example.soutenance.dto.NoteSubmission;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

import com.example.soutenance.repository.UserRepository;
import com.example.soutenance.repository.SalleRepository;
import com.example.soutenance.model.Salle;
import com.example.soutenance.dto.JuryRequest;
import com.example.soutenance.dto.JuryMemberRequest;
import com.example.soutenance.model.JuryMember;

@RestController
@RequestMapping("/api/jury")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class JuryController {

    @Autowired private SoutenanceRepository soutenanceRepository;
    @Autowired private NoteRepository noteRepository;
    @Autowired private JuryRepository juryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SalleRepository salleRepository;

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("user");
    }

    // ── Convertit une Soutenance en Map pour éviter les boucles JSON ──
    private Map<String, Object> soutenanceToMap(Soutenance s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("date", s.getDate());

        // Salle — objet simplifié, pas de soutenanceActive pour éviter boucle
        if (s.getSalleId() != null) {
            Salle salle = salleRepository.findById(s.getSalleId()).orElse(null);
            if (salle != null) {
                Map<String, Object> salleMap = new LinkedHashMap<>();
                salleMap.put("id", salle.getId());
                salleMap.put("nom", salle.getNom());
                salleMap.put("localisation", salle.getLocalisation());
                salleMap.put("capacite", salle.getCapacite());
                salleMap.put("disponible", true);
                map.put("salle", salleMap);
            } else {
                map.put("salle", null);
            }
        } else {
            map.put("salle", null);
        }

        // Étudiant simplifié
        if (s.getEtudiantId() != null) {
            User etudiant = userRepository.findById(s.getEtudiantId()).orElse(null);
            if (etudiant != null) {
                Map<String, Object> etudiantMap = new LinkedHashMap<>();
                etudiantMap.put("id", etudiant.getId());
                etudiantMap.put("nom", etudiant.getNom());
                etudiantMap.put("email", etudiant.getEmail());
                map.put("etudiant", etudiantMap);
            } else {
                map.put("etudiant", null);
            }
        } else {
            map.put("etudiant", null);
        }

        // Jury simplifié
        if (s.getJuryId() != null) {
            Jury jury = juryRepository.findById(s.getJuryId()).orElse(null);
            if (jury != null) {
                Map<String, Object> juryMap = new LinkedHashMap<>();
                juryMap.put("id", jury.getId());
                juryMap.put("nom", jury.getNom());
                map.put("jury", juryMap);
            } else {
                map.put("jury", null);
            }
        } else {
            map.put("jury", null);
        }

        return map;
    }

    @GetMapping("/soutenances")
    public ResponseEntity<?> getSoutenances(HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        List<Map<String, Object>> result = soutenanceRepository.findAll()
                .stream()
                .map(this::soutenanceToMap)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/membres")
    public ResponseEntity<?> getMembres() {
        return ResponseEntity.ok(userRepository.findByRole("JURY"));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getAllJuries() {
        return ResponseEntity.ok(juryRepository.findAll());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createJury(@RequestBody JuryRequest request) {
        if (request.getMembers() == null || request.getMembers().size() != 3) {
            return ResponseEntity.badRequest().body("Le jury doit contenir exactement 3 membres");
        }

        Set<String> roles = new HashSet<>();
        Set<Long> userIds = new HashSet<>();

        for (JuryMemberRequest jm : request.getMembers()) {
            if (!Arrays.asList("Président", "Rapporteur", "Encadrant").contains(jm.getRole())) {
                return ResponseEntity.badRequest().body("Rôle invalide : " + jm.getRole());
            }
            roles.add(jm.getRole());
            userIds.add(jm.getUserId());
        }

        if (roles.size() != 3)
            return ResponseEntity.badRequest().body("Les rôles doivent être distincts et au nombre de 3");
        if (userIds.size() != 3)
            return ResponseEntity.badRequest().body("Un utilisateur ne peut avoir qu'un seul rôle dans le jury");

        Jury jury = new Jury();
        jury.setNom(request.getNom());

        for (JuryMemberRequest jm : request.getMembers()) {
            User user = userRepository.findById(jm.getUserId()).orElse(null);
            if (user == null || !"JURY".equals(user.getRole()))
                return ResponseEntity.badRequest().body("Utilisateur invalide ou sans le rôle JURY");

            JuryMember member = new JuryMember();
            member.setJury(jury);
            member.setUser(user);
            member.setRole(jm.getRole());
            jury.getMembers().add(member);
        }

        juryRepository.save(jury);
        return ResponseEntity.ok("Jury créé avec succès");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateJury(@PathVariable Long id, @RequestBody JuryRequest request) {
        Jury jury = juryRepository.findById(id).orElse(null);
        if (jury == null)
            return ResponseEntity.badRequest().body("Jury non trouvé");

        if (request.getMembers() == null || request.getMembers().size() != 3)
            return ResponseEntity.badRequest().body("Le jury doit contenir exactement 3 membres");

        Set<String> roles = new HashSet<>();
        Set<Long> userIds = new HashSet<>();

        for (JuryMemberRequest jm : request.getMembers()) {
            if (!Arrays.asList("Président", "Rapporteur", "Encadrant").contains(jm.getRole()))
                return ResponseEntity.badRequest().body("Rôle invalide : " + jm.getRole());
            roles.add(jm.getRole());
            userIds.add(jm.getUserId());
        }

        if (roles.size() != 3)
            return ResponseEntity.badRequest().body("Les rôles doivent être distincts et au nombre de 3");
        if (userIds.size() != 3)
            return ResponseEntity.badRequest().body("Un utilisateur ne peut avoir qu'un seul rôle dans le jury");

        jury.setNom(request.getNom());
        jury.getMembers().clear();

        for (JuryMemberRequest jm : request.getMembers()) {
            User user = userRepository.findById(jm.getUserId()).orElse(null);
            if (user == null || !"JURY".equals(user.getRole()))
                return ResponseEntity.badRequest().body("Utilisateur invalide ou sans le rôle JURY");

            JuryMember member = new JuryMember();
            member.setJury(jury);
            member.setUser(user);
            member.setRole(jm.getRole());
            jury.getMembers().add(member);
        }

        juryRepository.save(jury);
        return ResponseEntity.ok("Jury modifié avec succès");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteJury(@PathVariable Long id) {
        if (!juryRepository.existsById(id))
            return ResponseEntity.badRequest().body("Jury non trouvé");
        juryRepository.deleteById(id);
        return ResponseEntity.ok("Jury supprimé avec succès");
    }

    @GetMapping("/mes-soutenance")
    public ResponseEntity<?> getMesSoutenances(HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> result = soutenanceRepository.findAll()
                .stream()
                .filter(s -> s.getJuryId() != null)
                .filter(s -> {
                    // Chercher si cet utilisateur fait partie du jury
                    Jury jury = juryRepository.findById(s.getJuryId()).orElse(null);
                    if (jury == null) return false;
                    return jury.getMembers().stream()
                            .anyMatch(m -> m.getUser().getId().equals(user.getId()));
                })
                .filter(s -> s.getDate() != null && s.getDate().isAfter(now))
                .map(this::soutenanceToMap)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/notes/soutenance/{soutenanceId}")
    public ResponseEntity<?> getNotes(@PathVariable Long soutenanceId) {
        return ResponseEntity.ok(noteRepository.findBySoutenanceId(soutenanceId));
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

        double somme = notes.stream().mapToDouble(Note::getNote).sum();
        double moyenne = somme / notes.size();

        String mention;
        if (moyenne < 10)       mention = "Redoublant";
        else if (moyenne < 12)  mention = "Passable";
        else if (moyenne < 14)  mention = "Assez bien";
        else if (moyenne < 16)  mention = "Bien";
        else if (moyenne < 18)  mention = "Très bien";
        else                    mention = "Excellent";

        Map<String, Object> response = new HashMap<>();
        response.put("moyenne", moyenne);
        response.put("mention", mention);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/noter")
    public ResponseEntity<?> attribuerNote(
            @RequestBody NoteSubmission request,
            HttpSession session) {

        User user = getAuthenticatedUser(session);
        if (user == null || !"JURY".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        Soutenance soutenance = soutenanceRepository.findById(request.getSoutenanceId())
                .orElse(null);
        if (soutenance == null)
            return ResponseEntity.badRequest().body("Soutenance non trouvée");

        Note note = noteRepository.findBySoutenanceIdAndMembreId(soutenance.getId(), user.getId());
        if (note == null) {
            note = new Note();
            note.setSoutenance(soutenance);
            note.setMembre(user);
        }

        note.setNote(request.getNote());
        note.setCommentaire(request.getCommentaire());
        noteRepository.save(note);

        return ResponseEntity.ok("Note attribuée avec succès");
    }
}