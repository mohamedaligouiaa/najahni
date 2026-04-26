package com.example.soutenance.repository;

import com.example.soutenance.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {
    List<Soutenance> findByEtudiantId(Long etudiantId);
    
    boolean existsByEtudiantId(Long etudiantId);

    @Query("SELECT s FROM Soutenance s WHERE s.salle = :salle AND " +
           "((s.creneau.date <= :start AND :start < FUNCTION('TIMESTAMPADD', MINUTE, 30, s.creneau.date)) OR " +
           " (s.creneau.date < :end AND :end <= FUNCTION('TIMESTAMPADD', MINUTE, 30, s.creneau.date)) OR " +
           " (:start <= s.creneau.date AND s.creneau.date < :end))")
    List<Soutenance> findOverlappingBySalle(@Param("salle") String salle, 
                                           @Param("start") LocalDateTime start, 
                                           @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Soutenance s " +
    	       "JOIN s.jury j " +
    	       "JOIN j.members m " +
    	       "WHERE m.user.id = :userId " +
    	       "AND s.creneau.date > :now " +
    	       "AND s.id NOT IN (SELECT n.soutenance.id FROM Note n WHERE n.membre.id = :userId)")
    	List<Soutenance> findAvailableByJury(
    	        @Param("userId") Long userId,
    	        @Param("now") LocalDateTime now);

    @Query("SELECT s FROM Soutenance s " +
           "JOIN s.jury j " +
           "JOIN j.members m " +
           "WHERE m.user.id IN :userIds AND " +
           "((s.creneau.date <= :start AND :start < FUNCTION('TIMESTAMPADD', MINUTE, 30, s.creneau.date)) OR " +
           " (s.creneau.date < :end AND :end <= FUNCTION('TIMESTAMPADD', MINUTE, 30, s.creneau.date)) OR " +
           " (:start <= s.creneau.date AND s.creneau.date < :end))")
    List<Soutenance> findOverlappingByJuryMembers(@Param("userIds") List<Long> userIds, 
                                                 @Param("start") LocalDateTime start, 
                                                 @Param("end") LocalDateTime end);
}
