package com.dev.backend.service;

import com.dev.backend.DTO.LoginRequestDTO;
import com.dev.backend.DTO.SignUpRequestDTO;
import com.dev.backend.DTO.UserRegisterDTO;
import com.dev.backend.DTO.UserResponseDTO;
import com.dev.backend.Security.JWTService;
import com.dev.backend.enums.Role;
import com.dev.backend.enums.Status;
import com.dev.backend.model.User;
import com.dev.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for User management
 * Handles business logic for user operations like registration, retrieval, etc.
 */
@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jWTService;

    /**
     * Constructor for dependency injection
     * @param userRepo UserRepository instance
     */
    public UserService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JWTService jWTService){
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jWTService = jWTService;
    }

    /**
     * Register a new user in the system
     * Validates that email is unique before saving
     * @param userDTO Sign object containing registration details
     * @throws IllegalArgumentException if email already exists
     */
    public void registerUser(SignUpRequestDTO userDTO){
        // Check if email already exists
        if(userRepo.existsByEmail(userDTO.getEmail())){
            throw new IllegalArgumentException("Email already exists");
        }
        // Save user to database
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setName(userDTO.getName());
        user.setRole(Role.STUDENT);
        user.setStatus(Status.ACTIVE);
        userRepo.save(user);
    }

    public String loginUser(LoginRequestDTO request){
        Authentication authentication =
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return jWTService.generateToken(userDetails);


    }

    /**
     * Get user by ID
     * @param id User ID
     * @return UserResponseDTO containing user details
     * @throws RuntimeException if user not found
     */
    public UserResponseDTO getUserById(Long id){
        User user = userRepo.findById(id).orElseThrow(()->
            new RuntimeException("User not found with ID: " + id));
        return convertToResponseDTO(user);
    }

    /**
     * Get user by email
     * @param email User email
     * @return UserResponseDTO containing user details
     * @throws RuntimeException if user not found
     */
    public UserResponseDTO getUserByEmail(String email){
        User user = userRepo.findByEmail(email).orElseThrow(()->
            new RuntimeException("User not found with email: " + email));
        return convertToResponseDTO(user);
    }

    /**
     * Get all users in the system
     * @return List of UserResponseDTOs for all users
     */
    public List<UserResponseDTO> getAllUsers(){
        return userRepo.findAll().stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Check if email already exists in system
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    public boolean emailExists(String email){
        return userRepo.existsByEmail(email);
    }

    /**
     * Convert User entity to UserResponseDTO
     * Used to hide sensitive information like password
     * @param user User entity
     * @return UserResponseDTO
     */
    private UserResponseDTO convertToResponseDTO(User user){
        return UserResponseDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .status(user.getStatus())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}


