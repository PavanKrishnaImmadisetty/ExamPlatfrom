package com.dev.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponseRequestDTO {
    private Long questionId;
    private Long selectedOptionId;
    private String answerText;
}
