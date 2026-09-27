package com.dev.backend.service;



import com.dev.backend.DTO.AttemptResponseDTO;
import com.dev.backend.DTO.StudentResponseRequestDTO;
import com.dev.backend.DTO.StudentResponseResponseDTO;
import com.dev.backend.DTO.UserResponseDTO;
import com.dev.backend.enums.AttemptStatus;
import com.dev.backend.enums.ExamState;
import com.dev.backend.enums.QuestionType;
import com.dev.backend.model.*;
import com.dev.backend.repository.AttemptRepository;
import com.dev.backend.repository.ExamRepository;
import com.dev.backend.repository.QuestionRepository;
import com.dev.backend.repository.StudentResponseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttemptService {

    private final ExamRepository examRepo;
    private final AttemptRepository attemptRepo;
    private final StudentResponseRepository studentResponseRepo;
    private final QuestionRepository questionRepo;

    // Notice we removed UserRepository since we inject the User directly now
    public AttemptService(ExamRepository examRepo, AttemptRepository attemptRepo,
                          StudentResponseRepository studentResponseRepo, QuestionRepository questionRepo) {
        this.examRepo = examRepo;
        this.attemptRepo = attemptRepo;
        this.studentResponseRepo = studentResponseRepo;
        this.questionRepo = questionRepo;
    }

    public boolean isExamExists(Long examId, User currentUser) {
        if (!examRepo.existsById(examId)) return false;

        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (exam.getExamState() == ExamState.DRAFT || exam.getExamState() == ExamState.CLOSED) {
            return false;
        }

        return !attemptRepo.existsByExamAndUser(exam, currentUser);
    }

    @Transactional
    public AttemptResponseDTO startAttempt(Long examId, User currentUser) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

        // 1. Check if exam is PUBLISHED
        if (exam.getExamState() == ExamState.DRAFT || exam.getExamState() == ExamState.CLOSED) {
            throw new RuntimeException("Exam is not available for attempts");
        }

        // 2. TIME CHECK LOGIC: Get exact current time
        LocalDateTime now = LocalDateTime.now();

        // Check if student is too early
        if (now.isBefore(exam.getExamStartTime())) {
            throw new RuntimeException("The exam has not started yet. Please wait until " + exam.getExamStartTime());
        }

        // Check if student is too late
        if (now.isAfter(exam.getExamEndTime())) {
            throw new RuntimeException("The exam window has closed. It ended at " + exam.getExamEndTime());
        }

        // 3. Check if student already attempted it
        if (attemptRepo.existsByExamAndUser(exam, currentUser)) {
            throw new RuntimeException("You have already attempted this exam");
        }

        // 4. Create the attempt
        Attempt attempt = Attempt.builder()
                .user(currentUser)
                .exam(exam)
                .attemptDate(now) // Using the 'now' variable we already created
                .startTime(now)
                .status(AttemptStatus.IN_PROGRESS)
                .totalMarks(exam.getMarks())
                .obtainedMarks(0)
                .build();

        return convertToResponseDTO(attemptRepo.save(attempt));
    }

    public AttemptResponseDTO getAttemptByExam(Long examId, User currentUser) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

        Attempt attempt = attemptRepo.findByExamAndUser(exam, currentUser)
                .orElseThrow(() -> new RuntimeException("No attempt found for this exam"));

        return convertToResponseDTO(attempt);
    }

    @Transactional(readOnly = true)
    public AttemptResponseDTO getAttemptById(Long attemptId, Long userId) {
        Attempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

        if (userId != null && !attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: This attempt does not belong to you");
        }

        return convertToResponseDTO(attempt);
    }

    @Transactional(readOnly = true)
    public AttemptResponseDTO getAttemptById(Long attemptId, User currentUser) {
        return getAttemptById(attemptId, currentUser != null ? currentUser.getId() : null);
    }

    @Transactional
    public StudentResponseResponseDTO saveStudentResponse(Long attemptId, StudentResponseRequestDTO request, User currentUser) {
        Attempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

        if (currentUser != null && !attempt.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: This attempt does not belong to you");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot submit response: Attempt is already submitted");
        }

        Question question = questionRepo.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + request.getQuestionId()));

        StudentResponse response = studentResponseRepo.findByAttemptAndQuestion(attempt, question)
                .orElse(new StudentResponse());

        if (response.getId() != null) {
            // Update existing
            response.setSelectedOptionId(request.getSelectedOptionId());
            response.setAnswerText(request.getAnswerText());
            response.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new
            response.setAttempt(attempt);
            response.setQuestion(question);
            response.setSelectedOptionId(request.getSelectedOptionId());
            response.setAnswerText(request.getAnswerText());
            response.setObtainedMarks(0);

            // Sync bidirectional relationship
            attempt.addResponse(response);
        }

        return convertResponseToDTO(studentResponseRepo.save(response));
    }

    @Transactional(readOnly = true)
    public List<StudentResponseResponseDTO> getResponsesForAttempt(Long attemptId, Long userId) {
        Attempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with ID: " + attemptId));

        if (userId != null && !attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        List<StudentResponse> responses = studentResponseRepo.findByAttempt(attempt);

        return responses.stream()
                .map(this::convertResponseToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentResponseResponseDTO> getResponsesForAttempt(Long attemptId, User currentUser) {
        return getResponsesForAttempt(attemptId, currentUser != null ? currentUser.getId() : null);
    }

    @Transactional
    public AttemptResponseDTO submitAttempt(Long attemptId, User currentUser) {
        Attempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (currentUser != null && !attempt.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Attempt has already been submitted");
        }

        int obtainedMarks = calculateMarks(attempt);

        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setEndTime(LocalDateTime.now());
        attempt.setObtainedMarks(obtainedMarks);

        return convertToResponseDTO(attemptRepo.save(attempt));
    }

    @Transactional(readOnly = true)
    public List<AttemptResponseDTO> getMyResults(UserResponseDTO currentUser) {
        if (currentUser == null || currentUser.getId() == null) return List.of();
        return getMyResultsByUserId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<AttemptResponseDTO> getMyResultsByUserId(Long userId) {
        if (userId == null) return List.of();
        List<Attempt> attempts = attemptRepo.findAll().stream()
            .filter(a -> a.getUser() != null && userId.equals(a.getUser().getId()) && a.getStatus() == AttemptStatus.COMPLETED)
            .collect(Collectors.toList());
        return attempts.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    private int calculateMarks(Attempt attempt) {
        List<StudentResponse> responses = studentResponseRepo.findByAttempt(attempt);
        int totalMarks = 0;

        for (StudentResponse response : responses) {
            Question question = response.getQuestion();
            boolean isCorrect = false;

            if (question.getQuestionType() == QuestionType.NUMERIC) {
                // Grading logic for typed integer answers
                if (response.getAnswerText() != null && !response.getAnswerText().trim().isEmpty()) {
                    try {
                        int studentAnswer = Integer.parseInt(response.getAnswerText().trim());
                        isCorrect = (studentAnswer == question.getNumericAnswer());
                    } catch (NumberFormatException e) {
                        isCorrect = false; // They typed letters instead of a number
                    }
                }
            }
            else if (response.getSelectedOptionId() != null) {
                // Existing grading logic for MCQ / TRUE_FALSE
                isCorrect = question.getOptions().stream()
                        .anyMatch(opt -> opt.getId().equals(response.getSelectedOptionId()) && opt.isCorrect());
            }

            if (isCorrect) {
                response.setObtainedMarks(question.getMarks());
                totalMarks += question.getMarks();
            } else {
                response.setObtainedMarks(0);
            }
        }
        studentResponseRepo.saveAll(responses);
        return totalMarks;
    }


    /**
     * Convert Attempt entity to AttemptResponseDTO
     * @param attempt Attempt entity
     * @return AttemptResponseDTO
     */
    private AttemptResponseDTO convertToResponseDTO(Attempt attempt) {
        return AttemptResponseDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExam().getId())
                .examTitle(attempt.getExam().getExamTitle())
                .userId(attempt.getUser().getId())
                .attemptDate(attempt.getAttemptDate())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .status(attempt.getStatus())
                .totalMarks(attempt.getTotalMarks())
                .obtainedMarks(attempt.getObtainedMarks())
                .build();
    }

    /**
     * Convert StudentResponse entity to StudentResponseResponseDTO
     * @param response StudentResponse entity
     * @return StudentResponseResponseDTO
     */
    private StudentResponseResponseDTO convertResponseToDTO(StudentResponse response) {
        String selectedOptionText = "";
        if (response.getSelectedOptionId() != null) {
            selectedOptionText = response.getQuestion().getOptions().stream()
                    .filter(option -> option.getId().equals(response.getSelectedOptionId()))
                    .map(Option::getOptionText)
                    .findFirst()
                    .orElse("");
        }

        return StudentResponseResponseDTO.builder()
                .id(response.getId())
                .attemptId(response.getAttempt().getId())
                .questionId(response.getQuestion().getId())
                .questionText(response.getQuestion().getQuestionText())
                .selectedOptionId(response.getSelectedOptionId())
                .selectedOptionText(selectedOptionText)
                .answerText(response.getAnswerText())
                .obtainedMarks(response.getObtainedMarks())
                .build();
    }
}
