package com.dev.backend.model;

import com.dev.backend.enums.QuestionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name="questions")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType ;

    @Column(nullable = false)
    private int marks;

    @Column(nullable = false)
    private int questionOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="exam_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private Exam exam;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options = new ArrayList<>();

}
