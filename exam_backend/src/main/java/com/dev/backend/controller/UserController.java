package com.dev.backend.controller;

import com.dev.backend.model.User;
import com.dev.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }
    @PostMapping("/add")
    public ResponseEntity<String> addUser(@RequestBody User user){

        userService.registerUser(user);
        return new ResponseEntity<>("User added successfully", HttpStatus.OK);
    }





}
