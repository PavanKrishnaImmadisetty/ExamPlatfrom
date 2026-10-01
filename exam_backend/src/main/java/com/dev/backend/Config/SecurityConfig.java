package com.dev.backend.Config;

import com.dev.backend.Security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*","https://*.vercel.app/*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // User endpoints - Admin management
                        .requestMatchers("/api/users/check-email/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/stats").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*/toggle-status").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/users/**").authenticated()

                        // Exam endpoints - Admin can also view exams
                        .requestMatchers(HttpMethod.GET, "/api/exams/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/exams/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/exams/**").hasAuthority("ROLE_INSTRUCTOR")

                        // Question endpoints - Admin can also view questions
                        .requestMatchers(HttpMethod.GET, "/api/questions/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/questions/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/questions/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasAuthority("ROLE_INSTRUCTOR")

                        // Attempt endpoints - Admin can also view attempts
                        .requestMatchers(HttpMethod.GET, "/api/attempts/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/attempts/**").hasAuthority("ROLE_STUDENT")

                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}