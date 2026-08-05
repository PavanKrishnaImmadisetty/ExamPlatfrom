package com.dev.backend.service;

import com.dev.backend.model.User;
import com.dev.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo){
        this.userRepo = userRepo;
    }

    public void registerUser(User user){

        if(userRepo.existsByEmail(user.getEmail())){
            throw new IllegalArgumentException("Email already exists");
        }
        userRepo.save(user);
    }




}
