package com.justdeepfried.FileManager.service;

import com.justdeepfried.FileManager.dto.user.UserLogin;
import com.justdeepfried.FileManager.security.auth.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager manager;
    private final JwtService jwtService;

    public ResponseEntity<String> login(UserLogin userLogin) {
        Authentication authentication = manager.authenticate(new UsernamePasswordAuthenticationToken(userLogin.username(), userLogin.password()));
        if (authentication.isAuthenticated()) {
            return ResponseEntity.ok(jwtService.generateToken(userLogin.username()));
        }
        return new ResponseEntity<>("Failed", HttpStatus.BAD_REQUEST);
    }

}
