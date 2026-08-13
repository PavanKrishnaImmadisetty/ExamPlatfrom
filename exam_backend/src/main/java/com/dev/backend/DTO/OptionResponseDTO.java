package com.dev.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for option responses from API
 * Contains option details for questions
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OptionResponseDTO {

    // Option ID
    private Long id;

    // Option text/content
    private String optionText;

    // Flag indicating if this is the correct answer (only visible to instructors)
    private boolean isCorrect;

    // Associated question ID
    private Long questionId;
}

