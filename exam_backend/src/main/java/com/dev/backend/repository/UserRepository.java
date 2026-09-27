package com.dev.backend.repository;

import com.dev.backend.enums.Role;
import com.dev.backend.enums.Status;
import com.dev.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long>{

    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    long countByRole(Role role);
    long countByStatus(Status status);
}
