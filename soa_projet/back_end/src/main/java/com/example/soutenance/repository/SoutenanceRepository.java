package com.example.soutenance.repository;

import com.example.soutenance.model.Soutenance;
import com.example.soutenance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {
    List<Soutenance> findByEtudiantId(Long etudiantId);
    @Query("SELECT s FROM Soutenance s " +
    	       "JOIN Jury j ON j.soutenance.id = s.id " +
    	       "WHERE j.membre.id = :userId " +
    	       "AND s.date > :now " +
    	       "AND s.id NOT IN (SELECT n.soutenance.id FROM Note n WHERE n.jury.membre.id = :userId  )")
    	List<Soutenance> findAvailableByJury(
    	        @Param("userId") Long userId,
    	        @Param("now") LocalDateTime now);
}
