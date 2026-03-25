package com.justdeepfried.FileManager.service;

import com.justdeepfried.FileManager.dto.PageResponse;
import com.justdeepfried.FileManager.dto.user.UserResponse;
import com.justdeepfried.FileManager.dto.user.UserUpdate;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.repository.UserRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import com.justdeepfried.FileManager.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final ProjectUserJoinService projectUserJoinService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public List<UserResponse> getAll() {
        return userRepo.findAll().stream().map(UserResponse::from).toList();
    }

    public PageResponse<UserResponse> searchUser(String search, Pageable pageable) {
        Specification<UserModel> spec = UserSpecification.getSpecification(search);
        return PageResponse.from(userRepo.findAll(spec, pageable).map(UserResponse::from));
    }

    public ResponseEntity<UserResponse> getUserById(long userId) {
        return ResponseEntity.ok(UserResponse.from(userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!"))));
    }

    public UserModel getUserByIdModel(long userId) {
        return userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!"));
    }

    public ResponseEntity<UserResponse> addUser(UserModel user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return ResponseEntity.ok(UserResponse.from(userRepo.save(user)));
    }

    @PreAuthorize("hasPermission(#userId, 'USER', 'PUT')")
    public ResponseEntity<UserResponse> editUser(long userId, UserUpdate update) {
        UserModel user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!"));
        if (update.username() != null) {
            user.setUsername(update.username());
        }
        if (update.roles() != null) {
            user.setRoles(update.roles());
        }
        return ResponseEntity.ok(UserResponse.from(userRepo.save(user)));
    }

    @PreAuthorize("hasPermission(#userId, 'USER', 'DELETE')")
    @Transactional
    public ResponseEntity<String> deleteUser(long userId) {
        projectUserJoinService.deleteUser(userId);
        UserModel user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!"));
        userRepo.delete(user);
        return new ResponseEntity<>("User deleted successfully!", HttpStatus.OK);
    }

    public UserModel getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = null;
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
            return userRepo.findByUsername(username);
        }
        return null;
    }
}
