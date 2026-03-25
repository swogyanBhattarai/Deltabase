package com.justdeepfried.FileManager.security.permission;

import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.model.ProjectUserJoin;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.repository.ProjectRepo;
import com.justdeepfried.FileManager.repository.ProjectUserRepo;
import com.justdeepfried.FileManager.repository.UserRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import com.justdeepfried.FileManager.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectHandler implements PermissionInterface<ProjectModel> {

    private final UserRepo userRepo;
    private final ProjectRepo projectRepo;
    private final ProjectUserRepo projectUserRepo;

    @Override
    public boolean hasPermission(UserPrincipal userPrincipal, ProjectModel target, String permission) {
        UserModel user = userRepo.findByUsername(userPrincipal.getUsername());
        ProjectUserJoin projectUser = projectUserRepo.findByUserUserIdAndProjectProjectId(user.getUserId(), target.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("ProjectUserRelationship with UserID: " + user.getUserId() + " and ProjectID: " + target.getProjectId() + " not found!"));
        switch (permission) {
            case "GET":
                return true;
            case "DELETE", "PUT":
                return (projectUser.getUserProjectRole().equals(ProjectUserJoin.PROJECT_ROLE.OWNER) || userPrincipal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
            case "POST":
                return (projectUser.getUserProjectRole().equals(ProjectUserJoin.PROJECT_ROLE.OWNER) || projectUser.getUserProjectRole().equals(ProjectUserJoin.PROJECT_ROLE.EDITOR) || isAdmin(userPrincipal));
            default:
                return false;
        }
    }

    private boolean isAdmin(UserPrincipal userPrincipal) {
        return userPrincipal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    public ProjectModel getById(long projectId) {
        return projectRepo.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project with ID: " + projectId + " not found!"));
    }
}
