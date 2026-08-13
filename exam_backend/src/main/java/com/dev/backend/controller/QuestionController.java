package com.dev.backend.controller;

import com.dev.backend.DTO.QuestionRequestDTO;
import com.dev.backend.DTO.QuestionResponseDTO;
import com.dev.backend.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;




@RestController
@RequestMapping("/api/instructor/question")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService){
        this.questionService = questionService;
    }

    @PostMapping("{examId}/add")
    public ResponseEntity<String> addQuestion(@PathVariable long examId,
                                              @RequestBody QuestionRequestDTO question){
        questionService.addQuestion(examId,question);
        return new ResponseEntity<>("Question added successfully", HttpStatus.OK);
    }

    @DeleteMapping("/delete/{questionId}")
    public ResponseEntity<String> deleteQuestion(@PathVariable long questionId){
        questionService.deleteQuestion(questionId);
        return new ResponseEntity<>("Question deleted succesfully",HttpStatus.OK);

    }

    @PutMapping("/update/{questionId}")
    public ResponseEntity<String> updateQuestion(@PathVariable long questionId,
                                                 @RequestBody QuestionRequestDTO question){
        questionService.updateQuestion(questionId,question);
        return new ResponseEntity<>("Question updated successfully",HttpStatus.OK);
    }

    @GetMapping("/get/{questionId}")
    public ResponseEntity<QuestionResponseDTO> getQuestionById(@PathVariable long questionId){
        QuestionResponseDTO qt = questionService.getQuestionById(questionId);
        return new ResponseEntity<>(qt,HttpStatus.OK);

    }

    @GetMapping("/getAll/{examId}")
    public ResponseEntity<List<QuestionResponseDTO>> getAllQuestions(@PathVariable Long examId){
        List<QuestionResponseDTO> qts = questionService.getAllQuestionsByExam(examId);
        return new ResponseEntity<>(qts,HttpStatus.OK);
    }
}