package com.dev.backend.controller;

import com.dev.backend.DTO.ExamRequestDTO;
import com.dev.backend.DTO.ExamResponseDTO;
import com.dev.backend.DTO.ExamUpdateDTO;
import com.dev.backend.model.Exam;
import com.dev.backend.model.User;
import com.dev.backend.service.ExamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/exams") // Pluralized to standard REST
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService){
        this.examService = examService;
    }

    @PostMapping
    public ResponseEntity<String> addExam(@AuthenticationPrincipal User currentUser,
                                          @RequestBody ExamRequestDTO exam){
        // Secure: The ID comes directly from the verified JWT, not the URL
        examService.createExam(currentUser, exam);
        return new ResponseEntity<>("Exam added successfully", HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> findExamById(@PathVariable long id){
        // Secure: Returns DTO, not the raw Entity
        ExamResponseDTO exam = examService.getExamDetailsById(id);
        return new ResponseEntity<>(exam, HttpStatus.OK);
    }

    @GetMapping("/published")
    public ResponseEntity<List<ExamResponseDTO>> getAllPublishedExams(){
        return new ResponseEntity<>(examService.getPublishedExams(), HttpStatus.OK);
    }

    @GetMapping("/my-exams")
    public ResponseEntity<List<ExamResponseDTO>> findMyExams(@AuthenticationPrincipal User currentUser){
        // Secure: Instructors can only fetch their own exams via this endpoint
        return new ResponseEntity<>(examService.getAllExamsByCreator(currentUser.getId()), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateExam(@PathVariable Long id,
                                             @RequestBody ExamUpdateDTO exam){
        examService.updateExam(id, exam);
        return new ResponseEntity<>("Exam updated successfully", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExamById(@PathVariable Long id){
        examService.deleteExamById(id);
        return new ResponseEntity<>("Exam deleted successfully", HttpStatus.OK);
    }

    @PatchMapping("/{id}/toggle-status") // PATCH is better for partial updates like toggles
    public ResponseEntity<String> toggleExamStatus(@PathVariable long id,
                                                   @AuthenticationPrincipal User currentUser){
        // Pass the verified email to your service layer
        String newState = examService.toggleExamState(id, currentUser.getEmail());
        return new ResponseEntity<>("Exam state updated to: " + newState, HttpStatus.OK);
    }
}