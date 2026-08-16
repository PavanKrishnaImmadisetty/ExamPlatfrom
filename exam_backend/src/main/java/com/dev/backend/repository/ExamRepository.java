package com.dev.backend.repository;

import com.dev.backend.enums.ExamState;
import com.dev.backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface ExamRepository extends JpaRepository<Exam,Long> {


    List<Exam> findByCreatorId(long creatorId);

    List<Exam> findByExamState(ExamState examState);
}
