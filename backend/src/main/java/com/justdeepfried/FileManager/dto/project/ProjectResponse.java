package com.justdeepfried.FileManager.dto.project;

import com.justdeepfried.FileManager.dto.file.FileResponse;
import com.justdeepfried.FileManager.model.ProjectModel;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectResponse (
        Long projectId,
        String projectName,
        String projectDesc,
        List<ProjectUserResponse> users,
        List<FileResponse> files,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectResponse from(ProjectModel projectModel) {
        return new ProjectResponse(
                projectModel.getProjectId(),
                projectModel.getProjectName(),
                projectModel.getProjectDesc(),
                projectModel.getUsers()
                        .stream()
                        .map(ProjectUserResponse::from)
                        .toList(),
                projectModel.getFiles()
                        .stream()
                        .map(FileResponse::from)
                        .toList(),
                projectModel.getCreatedAt(),
                projectModel.getUpdatedAt()
        );
    }
}
