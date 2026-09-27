package com.dev.backend.DTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for creating a new exam with questions
 * Contains validation constraints for exam details
 */
@Data
public class ExamRequestDTO {

    // Exam title - cannot be empty or null
    @NotBlank(message = "Exam title cannot be empty")
    @Size(min = 3, max = 100, message = "Exam title must be between 3 and 100 characters")
    private String examTitle;

    // Exam description - cannot be empty or null
    @NotBlank(message = "Exam description cannot be empty")
    @Size(min = 5, max = 500, message = "Exam description must be between 5 and 500 characters")
    private String examDescription;

    // Exam date - cannot be empty or null
    @NotBlank(message = "Exam date cannot be empty")
    private LocalDateTime examDate;

    @NotNull(message="Exam start time cannot be null")
    private LocalDateTime examStartTime;

    @NotNull(message="Exam end time cannot be null")
    private LocalDateTime examEndTime;

    // Exam duration in minutes - must be positive
    @NotNull(message = "Exam duration cannot be null")
    @Min(value = 5, message = "Exam duration must be at least 5 minutes")
    @Max(value = 480, message = "Exam duration cannot exceed 8 hours (480 minutes)")
    private int examDuration;

    // Total marks for the exam - must be positive
    @NotNull(message = "Marks cannot be null")
    @Min(value = 1, message = "Marks must be at least 1")
    @Max(value = 1000, message = "Marks cannot exceed 1000")
    private int marks;

    // Creator/Instructor ID - must be valid
//    @NotNull(message = "Creator ID cannot be null")
//    @Min(value = 1, message = "Creator ID must be a valid positive number")
//    private long creator;

    // List of questions for this exam
    @NotEmpty(message = "Questions list cannot be empty")
    @Valid
    private List<QuestionRequestDTO> questions;

}
