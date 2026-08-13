package com.dev.backend.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating exam details
 * Contains validation constraints for exam update fields
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamUpdateDTO {

    // Updated exam title
    @NotBlank(message = "Exam title cannot be empty")
    @Size(min = 3, max = 100, message = "Exam title must be between 3 and 100 characters")
    private String examTitle;

    // Updated exam description
    @NotBlank(message = "Exam description cannot be empty")
    @Size(min = 5, max = 500, message = "Exam description must be between 5 and 500 characters")
    private String examDescription;

    // Updated exam date
    @NotBlank(message = "Exam date cannot be empty")
    private String examDate;

    // Updated exam duration
    @NotNull(message = "Exam duration cannot be null")
    @Min(value = 5, message = "Exam duration must be at least 5 minutes")
    @Max(value = 480, message = "Exam duration cannot exceed 8 hours (480 minutes)")
    private int examDuration;

    // Updated marks
    @NotNull(message = "Marks cannot be null")
    @Min(value = 1, message = "Marks must be at least 1")
    @Max(value = 1000, message = "Marks cannot exceed 1000")
    private int marks;
}
