package com.dev.backend.DTO;

import com.dev.backend.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for question responses from API
 * Contains question details with associated options
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionResponseDTO {

    // Question ID
    private Long id;

    // Question text
    private String questionText;

    // Type of question (MCQ or DESCRIPTIVE)
    private QuestionType questionType;

    // Marks allocated to this question
    private int marks;

    // Order/sequence of question
    private int questionOrder;

    // Associated exam ID
    private Long examId;

    // List of options for this question
    private List<OptionResponseDTO> options;

    // Question creation timestamp
    private LocalDateTime createdAt;

    // Question last update timestamp
    private LocalDateTime updatedAt;
}

