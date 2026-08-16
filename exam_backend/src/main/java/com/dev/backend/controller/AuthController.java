package com.dev.backend.controller;

import com.dev.backend.DTO.ApiResponse;
import com.dev.backend.DTO.LoginRequestDTO;
import com.dev.backend.DTO.SignUpRequestDTO;
import com.dev.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService){
        this.userService = userService;
    }

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
}
