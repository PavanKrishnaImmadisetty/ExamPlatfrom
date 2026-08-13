package com.dev.backend.DTO;

import lombok.Data;

@Data
public class SignUpRequestDTO {

    private String name;
    private String email;
    private String password;

}
