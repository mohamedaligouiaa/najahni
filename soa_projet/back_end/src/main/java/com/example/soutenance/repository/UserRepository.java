package com.example.soutenance.repository;

import com.example.soutenance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    java.util.List<User> findByRole(String role);
}
