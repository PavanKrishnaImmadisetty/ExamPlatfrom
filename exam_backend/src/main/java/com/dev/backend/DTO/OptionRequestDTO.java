package com.dev.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating an option for a question
 * Contains validation constraints for option details
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OptionRequestDTO {

    // Option text - cannot be empty
    @NotBlank(message = "Option text cannot be empty")
    @Size(min = 1, max = 200, message = "Option text must be between 1 and 200 characters")
    private String optionText;

    // Flag indicating if this is the correct option
    private boolean isCorrect;


}
