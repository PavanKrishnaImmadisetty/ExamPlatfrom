package com.dev.backend.DTO;

import com.dev.backend.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a question with options
 * Contains validation constraints for question details
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionRequestDTO {

    // Question text - cannot be empty
    @NotBlank(message = "Question text cannot be empty")
    @Size(min = 5, max = 500, message = "Question text must be between 5 and 500 characters")
    private String questionText;

    // Type of question (MCQ or DESCRIPTIVE)
    @NotNull(message = "Question type cannot be null")
    private QuestionType questionType;

    // Marks allocated to this question
    @NotNull(message = "Marks cannot be null")
    @Min(value = 1, message = "Question must have at least 1 mark")
    @Max(value = 100, message = "Question cannot exceed 100 marks")
    private int marks;

    // Order/sequence of question in exam
    @NotNull(message = "Question order cannot be null")
    @Min(value = 1, message = "Question order must start from 1")
    private int questionOrder;

    // List of options for this question
    @NotEmpty(message = "Options list cannot be empty")
    @Valid
    private List<OptionRequestDTO> options;
}
