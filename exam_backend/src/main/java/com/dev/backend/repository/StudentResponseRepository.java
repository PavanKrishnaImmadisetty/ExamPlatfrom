package com.dev.backend.repository;

import com.dev.backend.model.Attempt;
import com.dev.backend.model.Question;
import com.dev.backend.model.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResponseRepository extends JpaRepository<StudentResponse, Long> {

    Optional<StudentResponse> findByAttemptAndQuestion(Attempt attempt, Question question);

    // FIX: Standard List return type
    List<StudentResponse> findByAttempt(Attempt attempt);
}
