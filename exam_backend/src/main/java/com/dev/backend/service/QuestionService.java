package com.dev.backend.service;

import com.dev.backend.DTO.OptionRequestDTO;
import com.dev.backend.DTO.OptionResponseDTO;
import com.dev.backend.DTO.QuestionRequestDTO;
import com.dev.backend.DTO.QuestionResponseDTO;
import com.dev.backend.model.Exam;
import com.dev.backend.model.Option;
import com.dev.backend.model.Question;
import com.dev.backend.repository.ExamRepository;
import com.dev.backend.repository.QuestionRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Question management
 * Handles business logic for question operations with associated options
 */
@Service
public class QuestionService {

    private final QuestionRepository questionRepo;
    private final ExamRepository examRepo;

    /**
     * Constructor for dependency injection
     * @param questionRepo QuestionRepository instance
     * @param examRepo ExamRepository instance
     */
    public QuestionService(QuestionRepository questionRepo,ExamRepository examRepo){
        this.questionRepo = questionRepo;
        this.examRepo = examRepo;
    }

    /**
     * Add a question with options to an exam
     * @param examId Exam ID
     * @param question QuestionRequestDTO containing question and option details
     * @throws RuntimeException if exam not found
     */
    public void addQuestion(long examId, QuestionRequestDTO question){

        // Fetch exam by ID, throw error if not found
        Exam exam = examRepo.findById(examId).orElseThrow(()-> new RuntimeException("Exam not found with ID: "+examId));

        // Create new Question object
        Question obj = new Question();

        // Set question properties from DTO
        obj.setQuestionText(question.getQuestionText());
        obj.setQuestionType(question.getQuestionType());
        obj.setMarks(question.getMarks());
        obj.setQuestionOrder(question.getQuestionOrder());

        // Associate question with exam
        obj.setExam(exam);

        // Create and populate options for the question
        List<Option> options = new ArrayList<>();
        for(OptionRequestDTO option : question.getOptions()){
            Option optObj = new Option();

            // Set option text
            optObj.setOptionText(option.getOptionText());

            // Set if this option is correct
            optObj.setCorrect(option.isCorrect());

            // Associate option with question
            optObj.setQuestion(obj);

            options.add(optObj);
        }

        // Set all options to question
        obj.setOptions(options);

        // Save question with cascading options
        questionRepo.save(obj);

    }



    /**
     * Delete a question and its associated options
     * @param questionId Question ID
     * @throws RuntimeException if question not found
     */
    public void deleteQuestion(long questionId){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
            new RuntimeException("Question not found with ID: "+questionId));
        questionRepo.delete(question);
    }

    /**
     * Get a specific question by ID as ResponseDTO
     * @param questionId Question ID
     * @return QuestionResponseDTO
     */
    public QuestionResponseDTO getQuestionById(long questionId){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
            new RuntimeException("Question not found with ID: "+questionId));
        return convertToResponseDTO(question);
    }

    /**
     * Update question details
     * Note: Options cannot be updated through this method
     * @param questionId Question ID
     * @param questionDTO QuestionRequestDTO with updated values
     */
    public void updateQuestion(long questionId, QuestionRequestDTO questionDTO){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
            new RuntimeException("Question not found with ID: "+questionId));

        // Update question properties
        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionType(questionDTO.getQuestionType());
        question.setMarks(questionDTO.getMarks());
        question.setQuestionOrder(questionDTO.getQuestionOrder());

        // Save updated question
        questionRepo.save(question);
    }

    public List<QuestionResponseDTO> getAllQuestionsByExam(Long examId){
        List<Question> qs = questionRepo.findByExamId(examId).orElseThrow(()->
                new RuntimeException("Exam not found with ID: "+examId));

        return qs.stream().map(this::convertToResponseDTO)
                .collect(Collectors.toList());

    }

    /**
     * Convert Question entity to QuestionResponseDTO
     * @param question Question entity
     * @return QuestionResponseDTO with associated options
     */
    private QuestionResponseDTO convertToResponseDTO(Question question){
        return QuestionResponseDTO.builder()
            .id(question.getId())
            .questionText(question.getQuestionText())
            .questionType(question.getQuestionType())
            .marks(question.getMarks())
            .questionOrder(question.getQuestionOrder())
            .examId(question.getExam().getId())
            .options(question.getOptions().stream()
                .map(this::convertOptionToResponseDTO)
                .collect(Collectors.toList()))
            .createdAt(question.getCreatedAt())
            .updatedAt(question.getUpdatedAt())
            .build();
    }

    /**
     * Convert Option entity to OptionResponseDTO
     * @param option Option entity
     * @return OptionResponseDTO
     */
    private OptionResponseDTO convertOptionToResponseDTO(Option option){
        return OptionResponseDTO.builder()
            .id(option.getId())
            .optionText(option.getOptionText())
            .isCorrect(option.isCorrect())
            .questionId(option.getQuestion().getId())
            .build();
    }
}
