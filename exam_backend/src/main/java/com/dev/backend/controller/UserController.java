package com.dev.backend.controller;

import com.dev.backend.DTO.*;

import com.dev.backend.enums.Role;
import com.dev.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for User management
 * Handles all user-related API endpoints for registration and retrieval
 */
@RestController
@RequestMapping("/api/users") // Pluralized to REST standards
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping("/test")
    public String test() {
        return "authorization working";
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(@PathVariable Long id){
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully", userService.getUserById(id))
        );
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByEmail(@PathVariable String email){
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "User retrieved successfully", userService.getUserByEmail(email))
        );
    }

    // STRICTLY ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers(){
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Users retrieved successfully", userService.getAllUsers())
        );
    }

    // STRICTLY ADMIN ONLY - Dashboard Stats
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStats() {
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "User stats retrieved", userService.getUserStats())
        );
    }

    // STRICTLY ADMIN ONLY - Promote/Demote User
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role newRole) {

        userService.updateUserRole(id, newRole);

        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "User role updated successfully to " + newRole, null)
        );
    }

    // STRICTLY ADMIN ONLY - Toggle User Status
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {

        String newStatus = userService.toggleUserStatus(id);

        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "User status updated to: " + newStatus, null)
        );
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@PathVariable String email){
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), exists ? "Email already exists" : "Email is available", exists)
        );
    }
}