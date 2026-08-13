package com.dev.backend.DTO;

import com.dev.backend.enums.Role;
import com.dev.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user responses from API
 * Contains user details without sensitive information like password
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {

    // User ID
    private Long id;

    // User's full name
    private String name;

    // User's email
    private String email;

    // User role (ADMIN, STUDENT, INSTRUCTOR)
    private Role role;

    // User account status (ACTIVE, INACTIVE)
    private Status status;

    // Account creation timestamp
    private LocalDateTime createdAt;

    // Account last update timestamp
    private LocalDateTime updatedAt;
}

