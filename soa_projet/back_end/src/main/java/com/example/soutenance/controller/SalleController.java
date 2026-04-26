package com.example.soutenance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salles")
public class SalleController {

    @GetMapping("/list")
    public ResponseEntity<?> getSalles() {
        // En attendant que vos collègues fassent la table Salle, 
        // je fournis une liste fixe pour stopper l'erreur 404
        List<Map<String, Object>> salles = Arrays.asList("Salle A101", "Salle A102", "Amphi B", "Labo Info", "Visioconférence")
                .stream()
                .map(nom -> Map.<String, Object>of("id", (long) Math.abs(nom.hashCode()), "nom", nom))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(salles);
    }
}
