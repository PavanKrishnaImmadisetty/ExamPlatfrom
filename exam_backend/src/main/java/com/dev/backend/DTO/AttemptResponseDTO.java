package com.dev.backend.DTO;

import com.dev.backend.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttemptResponseDTO {
    private Long id;
    private Long examId;
    private String examTitle;
    private Long userId;
    private LocalDateTime attemptDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AttemptStatus status;
    private Integer totalMarks;
    private Integer obtainedMarks;
}
