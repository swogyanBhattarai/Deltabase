package com.justdeepfried.FileManager.dto.file;

import com.justdeepfried.FileManager.model.ProjectModel;

import java.time.LocalDateTime;

public record FileProjectResponse (
        Long projectId,
        String projectName,
        String projectDesc,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FileProjectResponse from(ProjectModel project) {
        return new FileProjectResponse(
                project.getProjectId(),
                project.getProjectName(),
                project.getProjectDesc(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
