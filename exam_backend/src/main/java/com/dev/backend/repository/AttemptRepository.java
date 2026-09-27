package com.dev.backend.repository;

import com.dev.backend.model.Attempt;
import com.dev.backend.model.Exam;
import com.dev.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    Optional<Attempt> findByExamAndUser(Exam exam, User user);

    boolean existsByExamAndUser(Exam exam, User user);

    // FIX: Removed Optional wrappers
    List<Attempt> findByExam(Exam exam);

    List<Attempt> findByUser(User user);
}
