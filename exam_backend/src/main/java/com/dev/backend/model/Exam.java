package com.dev.backend.model;


import com.dev.backend.enums.ExamState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.*;
import java.time.LocalDateTime;

@Entity
@Table(name="exams")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String examTitle;

    @Column(nullable = false)
    private String examDescription;

    @Column(nullable = false)
    private String examDate;

    @Column(nullable = false)
    private int examDuration;

    @Column(nullable = false)
    private int marks;

    @Enumerated(EnumType.STRING)
    private ExamState examState = ExamState.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="creator_id", referencedColumnName = "id",nullable = false)
    private User creator;

    @CreationTimestamp
    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name="updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "exams", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;
}
