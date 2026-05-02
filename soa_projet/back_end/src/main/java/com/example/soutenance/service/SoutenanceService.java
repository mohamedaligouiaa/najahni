package com.example.soutenance.service;

import com.example.soutenance.model.Jury;
import com.example.soutenance.model.JuryMember;
import com.example.soutenance.model.Soutenance;
import com.example.soutenance.repository.JuryRepository;
import com.example.soutenance.repository.SoutenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SoutenanceService {

    @Autowired
    private SoutenanceRepository soutenanceRepository;

    @Autowired
    private JuryRepository juryRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${api.utilisateurs.url:http://localhost:9006/api/users/}")
    private String urlUtilisateurs;

    public Soutenance saveSoutenance(Soutenance soutenance) throws Exception {
        Long id = soutenance.getId();

        // Validation : tous les champs obligatoires
        if (soutenance.getEtudiantId() == null) {
            throw new Exception("L'étudiant est obligatoire.");
        }
        if (soutenance.getDate() == null) {
            throw new Exception("Le créneau (date) est obligatoire.");
        }
        if (soutenance.getSalleId() == null) {
            throw new Exception("La salle est obligatoire.");
        }
        if (soutenance.getJuryId() == null) {
            throw new Exception("Le jury est obligatoire.");
        }

        LocalDateTime start = soutenance.getDate();
        LocalDateTime end = start.plusMinutes(30);

        // 1. Validation de l'étudiant via appel REST
        String urlEtudiant = urlUtilisateurs + soutenance.getEtudiantId();
        try {
            restTemplate.getForEntity(urlEtudiant, String.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new Exception("L'étudiant spécifié n'existe pas dans le système.");
        } catch (Exception e) {
            // En développement, si l'autre service est down, on ignore
        }

        // 1.5 Vérifier si le créneau est déjà pris par une autre soutenance
        List<Soutenance> dateExisting = soutenanceRepository.findByDate(soutenance.getDate());
        if (dateExisting.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
            throw new Exception("Ce créneau est déjà utilisé pour une autre soutenance.");
        }

        // 2. Vérifier qu'il n'a pas déjà une soutenance
        List<Soutenance> studentExisting = soutenanceRepository.findByEtudiantId(soutenance.getEtudiantId());
        if (studentExisting.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
            throw new Exception("L'étudiant a déjà une soutenance programmée.");
        }

        // 3. Auto-remplir l'encadrant depuis le Jury sélectionné
        Jury jury = juryRepository.findById(soutenance.getJuryId())
                .orElseThrow(() -> new Exception("Le jury spécifié n'existe pas."));
        
        // Chercher le membre avec le rôle "Encadrant" dans le jury
        JuryMember encadrantMember = jury.getMembers().stream()
                .filter(m -> "Encadrant".equals(m.getRole()))
                .findFirst()
                .orElse(null);
        
        if (encadrantMember != null) {
            soutenance.setEncadrantId(encadrantMember.getUser().getId());
        }

        // 4. Vérifier la disponibilité de la salle
        List<Soutenance> salleConflicts = soutenanceRepository.findOverlappingBySalle(soutenance.getSalleId(), start, end);
        if (salleConflicts.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
            throw new Exception("La salle est déjà occupée à cet horaire.");
        }

        // 5. Vérifier la disponibilité du jury
        List<Soutenance> juryConflicts = soutenanceRepository.findOverlappingByJury(soutenance.getJuryId(), start, end);
        if (juryConflicts.stream().anyMatch(s -> id == null || !s.getId().equals(id))) {
            throw new Exception("Le jury est déjà affecté à une autre soutenance à cet horaire.");
        }

        return soutenanceRepository.save(soutenance);
    }

    public void deleteSoutenance(Long id) throws Exception {
        soutenanceRepository.findById(id)
                .orElseThrow(() -> new Exception("Soutenance non trouvée."));
        soutenanceRepository.deleteById(id);
    }
}