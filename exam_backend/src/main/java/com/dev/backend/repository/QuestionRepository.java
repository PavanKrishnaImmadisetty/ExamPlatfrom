package com.dev.backend.repository;

import com.dev.backend.DTO.QuestionResponseDTO;
import com.dev.backend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface QuestionRepository extends JpaRepository<Question,Long> {

    Optional<List<Question>> findByExamId(Long examId);
}
