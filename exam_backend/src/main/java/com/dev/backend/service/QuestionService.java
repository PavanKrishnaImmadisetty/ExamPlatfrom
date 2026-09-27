package com.dev.backend.service;

import com.dev.backend.DTO.OptionRequestDTO;
import com.dev.backend.DTO.OptionResponseDTO;
import com.dev.backend.DTO.QuestionRequestDTO;
import com.dev.backend.DTO.QuestionResponseDTO;
import com.dev.backend.enums.QuestionType;
import com.dev.backend.model.Exam;
import com.dev.backend.model.Option;
import com.dev.backend.model.Question;
import com.dev.backend.model.User;
import com.dev.backend.repository.ExamRepository;
import com.dev.backend.repository.QuestionRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepo;
    private final ExamRepository examRepo;

    public QuestionService(QuestionRepository questionRepo, ExamRepository examRepo){
        this.questionRepo = questionRepo;
        this.examRepo = examRepo;
    }

    @Transactional
    public void addQuestion(User currentUser, long examId, QuestionRequestDTO question){
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

        // SECURITY: Verify the person adding the question is the exam creator
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: You do not own this exam.");
        }

        Question obj = new Question();
        obj.setQuestionText(question.getQuestionText());
        obj.setQuestionType(question.getQuestionType());
        obj.setMarks(question.getMarks());
        obj.setQuestionOrder(question.getQuestionOrder());
        obj.setExam(exam);

        obj.setNumericAnswer(question.getNumericAnswer());

        // FIX: Use the bidirectional helper method to sync Options safely
        if (question.getQuestionType() != QuestionType.NUMERIC && question.getOptions() != null) {
            for (OptionRequestDTO optionDTO : question.getOptions()) {
                Option optObj = new Option();
                optObj.setOptionText(optionDTO.getOptionText());
                optObj.setCorrect(optionDTO.isCorrect());

                obj.addOption(optObj); // Keeps Java and DB in perfect sync
            }
        }

        questionRepo.save(obj);
    }

    @Transactional
    public void deleteQuestion(User currentUser, long questionId){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
                new RuntimeException("Question not found with ID: "+questionId));

        if (!question.getExam().getCreator().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: You do not own this exam.");
        }

        questionRepo.delete(question);
    }



// ... inside QuestionService ...

    @Transactional
    public void updateQuestion(User currentUser, long questionId, QuestionRequestDTO questionDTO){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
                new RuntimeException("Question not found with ID: "+questionId));

        if (!question.getExam().getCreator().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: You do not own this exam.");
        }

        // 1. Update standard fields
        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionType(questionDTO.getQuestionType());
        question.setMarks(questionDTO.getMarks());
        question.setQuestionOrder(questionDTO.getQuestionOrder());
        question.setNumericAnswer(questionDTO.getNumericAnswer()); // Keep this from our last step!

        // 2. Safely Update Options
        if (questionDTO.getQuestionType() != QuestionType.NUMERIC && questionDTO.getOptions() != null) {

            // Map existing options by their ID for fast lookup
            Map<Long, Option> existingOptions = question.getOptions().stream()
                    .collect(Collectors.toMap(Option::getId, opt -> opt));

            // Clear the list (Hibernate won't delete them immediately, it waits to see what we add back)
            question.getOptions().clear();

            for (OptionRequestDTO optDTO : questionDTO.getOptions()) {
                if (optDTO.getId() != null && existingOptions.containsKey(optDTO.getId())) {
                    // Update existing option
                    Option existingOpt = existingOptions.get(optDTO.getId());
                    existingOpt.setOptionText(optDTO.getOptionText());
                    existingOpt.setCorrect(optDTO.isCorrect());
                    question.addOption(existingOpt);
                } else {
                    // It has no ID, so it's a brand-new option added during the edit
                    Option newOpt = new Option();
                    newOpt.setOptionText(optDTO.getOptionText());
                    newOpt.setCorrect(optDTO.isCorrect());
                    question.addOption(newOpt);
                }
            }
        } else if (questionDTO.getQuestionType() == QuestionType.NUMERIC) {
            // If they changed an MCQ to a NUMERIC question, delete all old options
            question.getOptions().clear();
        }

        questionRepo.save(question);
    }

    public QuestionResponseDTO getQuestionById(long questionId){
        Question question = questionRepo.findById(questionId).orElseThrow(()->
                new RuntimeException("Question not found with ID: "+questionId));
        return convertToResponseDTO(question);
    }

    public List<QuestionResponseDTO> getAllQuestionsByExam(Long examId){
        // FIX: Removed .orElseThrow() since the repository now correctly returns a List
        List<Question> qs = questionRepo.findByExamId(examId);

        return qs.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
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
                .numericAnswer(question.getNumericAnswer())
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
