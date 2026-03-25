package com.justdeepfried.FileManager.dto.user;

import com.justdeepfried.FileManager.model.ProjectUserJoin;

public record UserProjectResponse (
        Long projectId,
        String projectName,
        ProjectUserJoin.PROJECT_ROLE userRole
) {
    public static UserProjectResponse from(ProjectUserJoin projectUserJoin){
        return new UserProjectResponse(
                projectUserJoin.getProject().getProjectId(),
                projectUserJoin.getProject().getProjectName(),
                projectUserJoin.getUserProjectRole()
        );
    }
}
