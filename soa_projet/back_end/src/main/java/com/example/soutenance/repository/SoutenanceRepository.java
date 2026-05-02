package com.example.soutenance.repository;

import com.example.soutenance.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {
    List<Soutenance> findByEtudiantId(Long etudiantId);
    
    List<Soutenance> findByDate(LocalDateTime date);
    
    boolean existsByEtudiantId(Long etudiantId);

    @Query("SELECT s FROM Soutenance s WHERE s.salleId = :salleId AND " +
           "((s.date <= :start AND :start < FUNCTION('TIMESTAMPADD', MINUTE, 30, s.date)) OR " +
           " (s.date < :end AND :end <= FUNCTION('TIMESTAMPADD', MINUTE, 30, s.date)) OR " +
           " (:start <= s.date AND s.date < :end))")
    List<Soutenance> findOverlappingBySalle(@Param("salleId") Long salleId, 
                                           @Param("start") LocalDateTime start, 
                                           @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Soutenance s WHERE s.salleId IS NULL")
    List<Soutenance> findSansSalle();
    
    // Note: To check jury availability, it should ideally be handled by communicating with the Jury service.
    // We provide a basic query here assuming the jury ID is checked against existing soutenances.
    @Query("SELECT s FROM Soutenance s WHERE s.juryId = :juryId AND " +
           "((s.date <= :start AND :start < FUNCTION('TIMESTAMPADD', MINUTE, 30, s.date)) OR " +
           " (s.date < :end AND :end <= FUNCTION('TIMESTAMPADD', MINUTE, 30, s.date)) OR " +
           " (:start <= s.date AND s.date < :end))")
    List<Soutenance> findOverlappingByJury(@Param("juryId") Long juryId, 
                                          @Param("start") LocalDateTime start, 
                                          @Param("end") LocalDateTime end);
}
