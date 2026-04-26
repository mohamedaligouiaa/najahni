package com.example.soutenance.repository;

import com.example.soutenance.model.Creneau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CreneauRepository extends JpaRepository<Creneau, Long> {

    @Query("SELECT c FROM Creneau c WHERE c.date >= :start AND c.date < :end")
    List<Creneau> findOverlapping(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
