package com.dev.backend.model;


import com.dev.backend.enums.ExamState;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="exams")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String examTitle;

    @Column(nullable = false)
    private String examDescription;

    @Column(nullable = false)
    private LocalDateTime examDate;

    @Column(nullable = false)
    private int examDuration;

    @Column(nullable = false)
    private LocalDateTime examStartTime;

    @Column(nullable = false)
    private LocalDateTime examEndTime;

    @Column(nullable = false)
    private int marks;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExamState examState = ExamState.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="creator_id", referencedColumnName = "id", nullable = false)
    private User creator;

    @CreationTimestamp
    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name="updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "exam", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    // --- JPA Bidirectional Synchronization Methods ---

    public void addQuestion(Question question) {
        questions.add(question);
        question.setExam(this);
    }

    public void removeQuestion(Question question) {
        questions.remove(question);
        question.setExam(null);
    }
}