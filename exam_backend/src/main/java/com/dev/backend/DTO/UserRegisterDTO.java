package com.dev.backend.DTO;

import com.dev.backend.enums.Role;
import com.dev.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user registration with validation
 * Contains constraints for user signup
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterDTO {

    // User's full name
    private String name;

    // User's email - must be unique
    private String email;

    // User's password
    private String password;

    // User role (ADMIN, STUDENT, INSTRUCTOR)
    private Role role;
}

