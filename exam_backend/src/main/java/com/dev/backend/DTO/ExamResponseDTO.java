package com.dev.backend.DTO;

import com.dev.backend.enums.ExamState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for exam responses from API
 * Contains exam details for client consumption
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExamResponseDTO {

    // Exam ID
    private Long id;

    // Exam title
    private String examTitle;

    // Exam description
    private String examDescription;

    // Exam scheduled date
    private LocalDateTime examDate;

    // Exam duration in minutes
    private int examDuration;

    private LocalDateTime examStartTime;

    private LocalDateTime examEndTime;

    // Total marks for exam
    private int marks;

    // Current state of exam (DRAFT, PUBLISHED)
    private ExamState examState;

    // ID of instructor who created the exam
    private Long creatorId;

    // Number of questions in the exam
    private int questionCount;

    // Exam creation timestamp
    private LocalDateTime createdAt;

    // Exam last update timestamp
    private LocalDateTime updatedAt;
}

