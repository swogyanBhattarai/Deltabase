package com.justdeepfried.FileManager.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.justdeepfried.FileManager.dto.PageResponse;
import com.justdeepfried.FileManager.dto.user.UserResponse;
import com.justdeepfried.FileManager.dto.user.UserUpdate;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAll());
    }


    @GetMapping("/{userId:\\d+}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable long userId) {
        return userService.getUserById(userId);
    }

    @GetMapping("/search")
    public PageResponse<UserResponse> searchUsers(
            @RequestParam(required = false, defaultValue = "1") int pageNum,
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @RequestParam(required = false, defaultValue = "userId") String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Sort sort = null;

        if (sortDir.equalsIgnoreCase("ASC")) {
            sort = Sort.by(sortBy).ascending();
        } else {
            sort = Sort.by(sortBy).descending();
        }

        return userService.searchUser(search, PageRequest.of(pageNum - 1, pageSize, sort));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserModel user) {
        return userService.addUser(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> editUser(
            @PathVariable long userId,
            @RequestBody UserUpdate update
    ) {
        return userService.editUser(userId, update);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable long userId) {
        return userService.deleteUser(userId);
    }
}
