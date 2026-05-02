package com.example.soutenance.controller;

import com.example.soutenance.model.User;
import com.example.soutenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Endpoint pour récupérer un utilisateur par ID (utilisé par RestTemplate)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(userToMap(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Liste des étudiants
    @GetMapping("/etudiants")
    public ResponseEntity<?> getEtudiants() {
        List<Map<String, Object>> result = userRepository.findByRole("ETUDIANT")
                .stream().map(this::userToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // Liste des encadrants (membres jury qui peuvent encadrer)
    @GetMapping("/encadrants")
    public ResponseEntity<?> getEncadrants() {
        List<Map<String, Object>> result = userRepository.findByRole("JURY")
                .stream().map(this::userToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> userToMap(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("nom", u.getNom());
        map.put("email", u.getEmail());
        map.put("role", u.getRole());
        return map;
    }
}
