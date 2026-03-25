package com.justdeepfried.FileManager.dto.user;

import com.justdeepfried.FileManager.model.UserModel;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse (
        Long userId,
        String username,
        List<String> roles,
        List<UserProjectResponse> projects,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserResponse from(UserModel userModel) {
        return new UserResponse(
                userModel.getUserId(),
                userModel.getUsername(),
                userModel.getRoles(),
                userModel.getProjects()
                        .stream()
                        .map(UserProjectResponse::from)
                        .toList(),
                userModel.getCreatedAt(),
                userModel.getUpdatedAt()
        );
    }
}
