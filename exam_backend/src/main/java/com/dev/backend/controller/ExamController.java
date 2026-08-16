package com.dev.backend.controller;

import com.dev.backend.DTO.ExamRequestDTO;
import com.dev.backend.DTO.ExamResponseDTO;
import com.dev.backend.DTO.ExamUpdateDTO;
import com.dev.backend.model.Exam;
import com.dev.backend.service.ExamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/exam")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService){
        this.examService = examService;
    }

    @PostMapping("/add/{instructorId}")
    public ResponseEntity<String> addExam(@PathVariable long instructorId,
                                          @RequestBody ExamRequestDTO exam){
        examService.createExam(instructorId,exam);
        return new ResponseEntity<>("Exam added successfully", HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Exam> findExamById(@PathVariable long id){

        Exam exam = examService.getExamById(id);
        return new ResponseEntity<>(exam,HttpStatus.OK);
    }

    @GetMapping("/getPublishedExams/")
    public ResponseEntity<List<ExamResponseDTO>> getAllPublishedExams(){
        List<ExamResponseDTO> exams = examService.getPublishedExams();
        return new ResponseEntity<>(exams,HttpStatus.OK);
    }

    @GetMapping("/getByInstructor/{instructorId}")
    public ResponseEntity<List<ExamResponseDTO>> findExamByInstructor(@PathVariable Long instructorId){
        List<ExamResponseDTO> exams =  examService.getAllExamsByCreator(instructorId);
        return new ResponseEntity<>(exams,HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExamById(@PathVariable Long id){
        examService.deleteExamById(id);
        return new ResponseEntity<>("Exam deleted successfully",HttpStatus.OK);
    }

    @PutMapping("/update/{examId}")
    public ResponseEntity<String> updateExam(@PathVariable Long examId,
                                             @RequestBody ExamUpdateDTO exam){
        examService.updateExam(examId,exam);
        return new ResponseEntity<>("Exam updated successfully",HttpStatus.OK);
    }




}
