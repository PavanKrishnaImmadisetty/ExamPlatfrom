package com.dev.backend.model;

import com.dev.backend.enums.AttemptStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attempts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="exam_id", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private LocalDateTime attemptDate;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(name="obtained_marks")
    private Integer obtainedMarks;

    @Column(name="total_marks", nullable = false)
    private Integer totalMarks;

    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<StudentResponse> responses = new ArrayList<>();

    // --- JPA Bidirectional Synchronization Methods ---

    public void addResponse(StudentResponse response) {
        responses.add(response);
        response.setAttempt(this);
    }

    public void removeResponse(StudentResponse response) {
        responses.remove(response);
        response.setAttempt(null);
    }
}