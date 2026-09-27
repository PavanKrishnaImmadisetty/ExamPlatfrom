package com.dev.backend.service;

import com.dev.backend.DTO.ExamRequestDTO;
import com.dev.backend.DTO.ExamResponseDTO;
import com.dev.backend.DTO.ExamUpdateDTO;
import com.dev.backend.DTO.QuestionRequestDTO;
import com.dev.backend.enums.ExamState;
import com.dev.backend.model.Exam;
import com.dev.backend.model.User;
import com.dev.backend.repository.ExamRepository;
import com.dev.backend.repository.QuestionRepository;
import com.dev.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.beans.Transient;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Exam management
 * Handles business logic for exam operations like create, update, delete, retrieve
 */
@Service
public class ExamService {

    private final ExamRepository examRepo;
    private final UserRepository userRepo;
    private final QuestionService questionService;

    /**
     * Constructor for dependency injection
     * @param examRepo ExamRepository instance
     * @param userRepo UserRepository instance
     * @param questionService QuestionService instance
     */
    public ExamService(ExamRepository examRepo,UserRepository userRepo,QuestionService questionService){
        this.examRepo = examRepo;
        this.userRepo = userRepo;
        this.questionService = questionService;
    }

    /**
     * Create a new exam with questions
     * @param exam ExamRequestDTO containing exam details and questions
     * @throws RuntimeException if creator user not found
     */
    @Transactional
    public void createExam(User creator, ExamRequestDTO exam) {
        Exam obj = new Exam();

        // No need to fetch from userRepo, the creator is already verified via JWT!
        obj.setExamTitle(exam.getExamTitle());
        obj.setExamDescription(exam.getExamDescription());
        obj.setExamDate(exam.getExamDate());
        obj.setExamStartTime(exam.getExamStartTime());
        obj.setExamEndTime(exam.getExamEndTime());
        obj.setExamDuration(exam.getExamDuration());
        obj.setMarks(exam.getMarks());
        obj.setCreator(creator);
        obj.setExamState(ExamState.DRAFT);

        examRepo.save(obj);

        if(exam.getQuestions() != null && !exam.getQuestions().isEmpty()){
            for(QuestionRequestDTO questionDTO : exam.getQuestions()){
                questionService.addQuestion(creator, obj.getId(), questionDTO);
            }
        }
    }
    /**
     * Get all exams created by a specific instructor
     * @param creator Instructor/Creator ID
     * @return List of ExamResponseDTOs
     */
    public List<ExamResponseDTO> getAllExamsByCreator(Long creator){

        if(!userRepo.existsById(creator)){
            throw new RuntimeException("Instructor not found with ID:" + creator);
        }


        return examRepo.findByCreatorId(creator).stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    public List<ExamResponseDTO> getPublishedExams(){
        return examRepo.findByExamState(ExamState.PUBLISHED).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get exam by ID
     * @param id Exam ID
     * @return Exam entity
     * @throws RuntimeException if exam not found
     */
    public Exam getExamById(long id){
        return examRepo.findById(id).orElseThrow(()->
            new RuntimeException("Exam not found with ID: " + id));
    }

    /**
     * Get exam details as response DTO
     * @param id Exam ID
     * @return ExamResponseDTO
     */
    public ExamResponseDTO getExamDetailsById(long id){
        Exam exam = getExamById(id);
        return convertToResponseDTO(exam);
    }

    /**
     * Update exam details
     * Note: Only updates exam metadata, not questions
     * @param id Exam ID
     * @param exam ExamUpdateDTO containing updated exam details
     * @throws RuntimeException if exam not found
     */
    public void updateExam(Long id, ExamUpdateDTO exam){

        // Fetch exam to update
        Exam obj = examRepo.findById(id).orElseThrow(()->
            new RuntimeException("Exam not found with ID: " + id));

        // Update exam properties
        obj.setExamTitle(exam.getExamTitle());
        obj.setExamDescription(exam.getExamDescription());
        obj.setExamDate(exam.getExamDate());
        obj.setExamStartTime(exam.getExamStartTime());
        obj.setExamEndTime(exam.getExamEndTime());
        obj.setExamDuration(exam.getExamDuration());
        obj.setMarks(exam.getMarks());
        obj.setExamState(exam.getExamState());
        // Save updated exam
        examRepo.save(obj);
    }

    /**
     * Delete exam and all associated questions/options
     * @param id Exam ID
     * @throws RuntimeException if exam not found
     */
    public void deleteExamById(Long id){
        // Verify exam exists before deleting
        if(!examRepo.existsById(id)){
            throw new RuntimeException("Exam not found with ID: "+id);
        }
        Exam exam = getExamById(id);
        examRepo.delete(exam);
    }

    /**
     * Publish an exam (change state from DRAFT to PUBLISHED)
     * @param id Exam ID
     * @throws RuntimeException if exam not found
     */
    public void publishExam(Long id){
        if(!examRepo.existsById(id)){
            throw new RuntimeException("Exam not found with ID: "+id);
        }
        Exam exam = getExamById(id);
        exam.setExamState(ExamState.PUBLISHED);
        examRepo.save(exam);
    }

    //service toggling exam status
    @Transactional

    public String toggleExamState(long id,String userEmail){

        Exam exam = examRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + id));

        if(!exam.getCreator().getEmail().equals(userEmail)){
            throw new RuntimeException("Access Denied: You cannot modify an exam you did not create.");
        }

        if (exam.getExamState() == ExamState.DRAFT) {
            exam.setExamState(ExamState.PUBLISHED);
        } else {
            exam.setExamState(ExamState.DRAFT);
        }

        examRepo.save(exam);
        return exam.getExamState().name();

    }

    /**
     * Convert Exam entity to ExamResponseDTO
     * @param exam Exam entity
     * @return ExamResponseDTO
     */
    private ExamResponseDTO convertToResponseDTO(Exam exam){
        return ExamResponseDTO.builder()
            .id(exam.getId())
            .examTitle(exam.getExamTitle())
            .examDescription(exam.getExamDescription())
            .examDate(exam.getExamDate())
                .examStartTime(exam.getExamStartTime())
                .examEndTime(exam.getExamEndTime())
            .examDuration(exam.getExamDuration())
            .marks(exam.getMarks())
            .examState(exam.getExamState())
            .creatorId(exam.getCreator().getId())
            .questionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0)
            .createdAt(exam.getCreatedAt())
            .updatedAt(exam.getUpdatedAt())
            .build();
    }
}

