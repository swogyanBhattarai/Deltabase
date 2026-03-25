package com.justdeepfried.FileManager.dto.project;

import com.justdeepfried.FileManager.model.ProjectUserJoin;

public record ProjectUserResponse (
        Long userId,
        String username,
        ProjectUserJoin.PROJECT_ROLE userRole
) {
    public static ProjectUserResponse from(ProjectUserJoin join) {
        return new ProjectUserResponse(
                join.getUser().getUserId(),
                join.getUser().getUsername(),
                join.getUserProjectRole()
        );
    }
}
