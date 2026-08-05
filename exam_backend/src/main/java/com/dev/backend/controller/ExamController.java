package com.dev.backend.controller;

import com.dev.backend.DTO.ExamRequestDTO;
import com.dev.backend.DTO.ExamUpdateDTO;
import com.dev.backend.model.Exam;
import com.dev.backend.service.ExamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/instructor/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService){
        this.examService = examService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addExam(@RequestBody ExamRequestDTO exam){
        examService.createExam(exam);
        return new ResponseEntity<>("Exam added successfully", HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Exam> findExamById(@PathVariable long id){

        Exam exam = examService.getExamById(id);
        return new ResponseEntity<>(exam,HttpStatus.OK);
    }

    @GetMapping("/getByInstructor/{instructorId}")
    public ResponseEntity<List<Exam>> findExamByInstructor(@PathVariable Long instructorId){
        List<Exam> exams =  examService.getAllExamsByCreator(instructorId);
        return new ResponseEntity<>(exams,HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExamById(Long id){
        examService.deleteExamById(id);
        return new ResponseEntity<>("Exam deleted successfully",HttpStatus.OK);
    }

    @PutMapping("/update/{examId}")
    public ResponseEntity<String> updateExam(@PathVariable("examId") Long examId,
                                             @RequestBody ExamUpdateDTO exam){
        examService.updateExam(examId,exam);
        return new ResponseEntity<>("Exam updated successfully",HttpStatus.OK);
    }




}
