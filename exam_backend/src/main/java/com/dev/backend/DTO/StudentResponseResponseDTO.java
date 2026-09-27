package com.dev.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentResponseResponseDTO {
    private Long id;
    private Long attemptId;
    private Long questionId;
    private String questionText;
    private Long selectedOptionId;
    private String selectedOptionText;
    private String answerText;
    private Integer obtainedMarks;
}
