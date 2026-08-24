package com.dev.backend.Config;

import com.dev.backend.Security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter){
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login",
                                "/auth/register").permitAll()

                        .requestMatchers(HttpMethod.GET,"/api/exam/**").hasAnyAuthority("ROLE_STUDENT ","ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST,"/api/exam/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT,"/api/exam/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE,"/api/exam/**").hasAuthority("ROLE_INSTRUCTOR")

                        .requestMatchers(HttpMethod.GET, "/api/question/**")
                        .hasAnyAuthority("ROLE_STUDENT", "ROLE_INSTRUCTOR")

                        .requestMatchers(HttpMethod.POST, "/api/question/**")
                        .hasAuthority("ROLE_INSTRUCTOR")

                        .requestMatchers(HttpMethod.PUT, "/api/question/**")
                        .hasAuthority("ROLE_INSTRUCTOR")

                        .requestMatchers(HttpMethod.DELETE, "/api/question/**")
                        .hasAuthority("ROLE_INSTRUCTOR")

                        .anyRequest().authenticated()
                )

                .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                )
                ).
                addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager();
    }

}
