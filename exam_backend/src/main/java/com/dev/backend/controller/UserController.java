package com.dev.backend.controller;

import com.dev.backend.DTO.*;
import com.dev.backend.enums.Role;
import com.dev.backend.enums.Status;
import com.dev.backend.model.User;
import com.dev.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User management
 * Handles all user-related API endpoints for registration and retrieval
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /**
     * Constructor for dependency injection
     * @param userService UserService instance
     */
    public UserController(UserService userService){
        this.userService = userService;
    }

    /**
     * Register a new user in the system
     * POST /api/users/register
     * @param user User object with registration details
     * @return ApiResponse with success message
     */
    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@Valid @RequestBody SignUpRequestDTO user){
        // Set default status to ACTIVE for new users

        userService.registerUser(user);
        return new ResponseEntity<>(
            new ApiResponse<>(HttpStatus.CREATED.value(), "User registered successfully"),
            HttpStatus.CREATED
        );
    }

    @PostMapping("/auth/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginRequest){
        String token = userService.loginUser(loginRequest);
        return new ResponseEntity<>(token,HttpStatus.OK);
    }

    /**
     * Alternative endpoint for user registration (kept for backwards compatibility)
     * POST /api/users/add
     * @param user User object
     * @return ApiResponse with success message
     */


    /**
     * Get user by ID
     * GET /api/users/{id}
     * @param id User ID
     * @return ApiResponse with user details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(@PathVariable Long id){
        UserResponseDTO user = userService.getUserById(id);
        return new ResponseEntity<>(
            new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully", user),
            HttpStatus.OK
        );
    }

    /**
     * Get user by email
     * GET /api/users/email/{email}
     * @param email User email
     * @return ApiResponse with user details
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByEmail(@PathVariable String email){
        UserResponseDTO user = userService.getUserByEmail(email);
        return new ResponseEntity<>(
            new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully", user),
            HttpStatus.OK
        );
    }

    /**
     * Get all users in the system
     * GET /api/users/all
     * @return ApiResponse with list of all users
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers(){
        List<UserResponseDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(
            new ApiResponse<>(HttpStatus.OK.value(), "Users retrieved successfully", users),
            HttpStatus.OK
        );
    }

    /**
     * Check if email already exists
     * GET /api/users/check-email/{email}
     * @param email Email to check
     * @return ApiResponse with boolean result
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@PathVariable String email){
        boolean exists = userService.emailExists(email);
        String message = exists ? "Email already exists" : "Email is available";
        return new ResponseEntity<>(
            new ApiResponse<>(HttpStatus.OK.value(), message, exists),
            HttpStatus.OK
        );
    }
}
