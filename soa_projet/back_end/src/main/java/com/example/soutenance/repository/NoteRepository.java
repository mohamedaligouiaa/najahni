package com.example.soutenance.repository;

import com.example.soutenance.model.Note;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findBySoutenanceId(Long soutenanceId);
   
    Note findBySoutenanceIdAndMembreId(Long soutenanceId, Long membreId);
    
}
