package com.dev.backend.controller;

import com.dev.backend.DTO.AttemptResponseDTO;
import com.dev.backend.DTO.StudentResponseRequestDTO;
import com.dev.backend.DTO.StudentResponseResponseDTO;
import com.dev.backend.DTO.UserResponseDTO;
import com.dev.backend.model.User;
import com.dev.backend.service.AttemptService;
import com.dev.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/attempts") // FIX: Pluralized
public class AttemptController {

    private final AttemptService attemptService;
    private final UserService userService;
    public AttemptController(AttemptService attemptService,UserService userService) {
        this.attemptService = attemptService;
        this.userService = userService;
    }

    @PostMapping("/exam/{examId}")
    public ResponseEntity<AttemptResponseDTO> startAttempt(@PathVariable Long examId,
                                                           @AuthenticationPrincipal User currentUser) {
        // Optimization: Pass the User object directly
        AttemptResponseDTO attempt = attemptService.startAttempt(examId, currentUser);
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<AttemptResponseDTO> getAttemptByExam(@PathVariable Long examId,
                                                               @AuthenticationPrincipal User currentUser) {
        AttemptResponseDTO attempt = attemptService.getAttemptByExam(examId, currentUser);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<AttemptResponseDTO> getAttempt(@PathVariable Long attemptId,
                                                         @AuthenticationPrincipal User currentUser,
                                                         Principal principal) {
        Long userId = (currentUser != null && currentUser.getId() != null)
                ? currentUser.getId()
                : (principal != null ? userService.getUserByEmail(principal.getName()).getId() : null);
        AttemptResponseDTO attempt = attemptService.getAttemptById(attemptId, userId);
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/{attemptId}/responses") // FIX: Pluralized response
    public ResponseEntity<StudentResponseResponseDTO> saveResponse(
            @PathVariable Long attemptId,
            @RequestBody StudentResponseRequestDTO request,
            @AuthenticationPrincipal User currentUser) {
        StudentResponseResponseDTO response = attemptService.saveStudentResponse(attemptId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{attemptId}/responses")
    public ResponseEntity<List<StudentResponseResponseDTO>> getResponses(@PathVariable Long attemptId,
                                                                         @AuthenticationPrincipal User currentUser,
                                                                         Principal principal) {
        Long userId = (currentUser != null && currentUser.getId() != null)
                ? currentUser.getId()
                : (principal != null ? userService.getUserByEmail(principal.getName()).getId() : null);
        List<StudentResponseResponseDTO> responses = attemptService.getResponsesForAttempt(attemptId, userId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<AttemptResponseDTO> submitAttempt(@PathVariable Long attemptId,
                                                            @AuthenticationPrincipal User currentUser) {
        AttemptResponseDTO attempt = attemptService.submitAttempt(attemptId, currentUser);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/my-results")
    public ResponseEntity<List<AttemptResponseDTO>> getMyResults(@AuthenticationPrincipal User currentUser,
                                                                Principal principal) {
        Long userId = (currentUser != null && currentUser.getId() != null)
                ? currentUser.getId()
                : (principal != null ? userService.getUserByEmail(principal.getName()).getId() : null);
        List<AttemptResponseDTO> results = attemptService.getMyResultsByUserId(userId);
        return ResponseEntity.ok(results);
    }
    
}