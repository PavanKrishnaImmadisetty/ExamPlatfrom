package com.dev.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Generic API Response wrapper for all endpoints
 * Provides consistent response format for success and error responses
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    // HTTP Status Code
    private int status;

    // Response message
    private String message;

    // Response data (can be any object)
    private T data;

    // Timestamp of response
    private LocalDateTime timestamp;

    // Constructor for success responses without data
    public ApiResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor for success responses with data
    public ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}

