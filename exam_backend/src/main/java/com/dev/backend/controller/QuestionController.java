package com.dev.backend.controller;

import com.dev.backend.DTO.QuestionRequestDTO;
import com.dev.backend.DTO.QuestionResponseDTO;
import com.dev.backend.model.User;
import com.dev.backend.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;




@RestController
@RequestMapping("/api/questions") // Pluralized
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService){
        this.questionService = questionService;
    }

    @PostMapping("/exam/{examId}")
    public ResponseEntity<String> addQuestion(@AuthenticationPrincipal User currentUser,
                                              @PathVariable long examId,
                                              @RequestBody QuestionRequestDTO question){
        // Secure: Pass currentUser to verify ownership
        questionService.addQuestion(currentUser, examId, question);
        return new ResponseEntity<>("Question added successfully", HttpStatus.CREATED);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<String> deleteQuestion(@AuthenticationPrincipal User currentUser,
                                                 @PathVariable long questionId){
        questionService.deleteQuestion(currentUser, questionId);
        return new ResponseEntity<>("Question deleted successfully", HttpStatus.OK);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<String> updateQuestion(@AuthenticationPrincipal User currentUser,
                                                 @PathVariable long questionId,
                                                 @RequestBody QuestionRequestDTO question){
        questionService.updateQuestion(currentUser, questionId, question);
        return new ResponseEntity<>("Question updated successfully", HttpStatus.OK);
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionResponseDTO> getQuestionById(@PathVariable long questionId){
        return new ResponseEntity<>(questionService.getQuestionById(questionId), HttpStatus.OK);
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<QuestionResponseDTO>> getAllQuestions(@PathVariable Long examId){
        return new ResponseEntity<>(questionService.getAllQuestionsByExam(examId), HttpStatus.OK);
    }
}