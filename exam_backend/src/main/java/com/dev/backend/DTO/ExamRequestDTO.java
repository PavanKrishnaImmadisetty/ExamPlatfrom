package com.dev.backend.DTO;

import lombok.Data;

@Data
public class ExamRequestDTO {

    private String examTitle;
    private String examDescription;
    private String examDate;
    private int examDuration;
    private int marks;
    private long creator;


}
