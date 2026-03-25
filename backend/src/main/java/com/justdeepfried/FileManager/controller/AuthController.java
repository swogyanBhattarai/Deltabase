package com.justdeepfried.FileManager.controller;

import com.justdeepfried.FileManager.dto.user.UserLogin;
import com.justdeepfried.FileManager.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserLogin userLogin) {
        return authService.login(userLogin);
    }
}
