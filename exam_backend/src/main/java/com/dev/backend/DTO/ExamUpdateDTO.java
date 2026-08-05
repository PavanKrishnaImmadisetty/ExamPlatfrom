package com.dev.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamUpdateDTO {

    private String examTitle;
    private String examDescription;
    private String examDate;
    private int examDuration;
    private int marks;
}
