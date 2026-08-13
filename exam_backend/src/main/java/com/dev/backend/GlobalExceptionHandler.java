package com.dev.backend;

import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> illArgExcep(IllegalArgumentException ex){
        Map<String,Object> map = new HashMap<>();
        map.put("timestamp", LocalDateTime.now());
        map.put("status", HttpStatus.BAD_REQUEST.value());
        map.put("error","Bad Request");
        map.put("message",ex.getMessage());
        return new ResponseEntity<>(map, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String,Object>> handleResNotFoundExcep(RuntimeException ex){
        Map<String,Object> map = new HashMap<>();
        map.put("timestamp", LocalDateTime.now());
        map.put("status", HttpStatus.BAD_REQUEST.value());
        map.put("error","Bad Request");
        map.put("message",ex.getMessage());
        return new ResponseEntity<>(map, HttpStatus.BAD_REQUEST);
    }
}


