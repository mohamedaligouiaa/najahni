package com.example.soutenance.repository;

import com.example.soutenance.model.Jury;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JuryRepository extends JpaRepository<Jury, Long> {
}

