package com.dev.backend.repository;

import org.aspectj.weaver.patterns.TypePatternQuestions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.dev.backend.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Fixed: Removed Optional wrapper
    List<Question> findByExamId(Long examId);
}
