package com.dev.backend.service;

import com.dev.backend.DTO.ExamRequestDTO;
import com.dev.backend.DTO.ExamUpdateDTO;
import com.dev.backend.model.Exam;
import com.dev.backend.model.User;
import com.dev.backend.repository.ExamRepository;
import com.dev.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepo;
    private final UserRepository userRepo;

    public ExamService(ExamRepository examRepo,UserRepository userRepo){
        this.examRepo = examRepo;
        this.userRepo = userRepo;
    }

    public void createExam(ExamRequestDTO exam){

        Exam obj = new Exam();
        User creator = userRepo.findById(exam.getCreator()).
                orElseThrow(() -> new RuntimeException("User not found with ID: " + exam.getCreator()));
        obj.setExamTitle(exam.getExamTitle());
        obj.setExamDescription(exam.getExamDescription());
        obj.setExamDate(exam.getExamDate());
        obj.setExamDuration(exam.getExamDuration());
        obj.setMarks(exam.getMarks());
        obj.setCreator(creator);
        examRepo.save(obj);
    }

    public List<Exam> getAllExamsByCreator(Long creator){
        return examRepo.findByCreatorId(creator);
    }

    public Exam getExamById(long id){
        return examRepo.findById(id).orElseThrow(()->new RuntimeException("Exam not found with ID: " + id));
    }

    public void updateExam(Long id, ExamUpdateDTO exam){

        Exam obj = examRepo.findById(id).orElseThrow(()-> new RuntimeException("Exam not found with Id" + id));

        obj.setExamTitle(exam.getExamTitle());
        obj.setExamDescription(exam.getExamDescription());
        obj.setExamDate(exam.getExamDate());
        obj.setExamDuration(exam.getExamDuration());
        obj.setMarks(exam.getMarks());

        examRepo.save(obj);
    }

    public void deleteExamById(Long id){
        examRepo.deleteById(id);
    }


}
