package com.justdeepfried.FileManager.service;

import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.model.ProjectUserJoin;
import com.justdeepfried.FileManager.repository.ProjectRepo;
import com.justdeepfried.FileManager.repository.ProjectUserRepo;
import com.justdeepfried.FileManager.repository.UserRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectUserJoinService {

    private final ProjectUserRepo projectUserRepo;
    private final UserRepo userRepo;
    private final ProjectRepo projectRepo;

    public List<ProjectModel> findAllProjectsByUserId(long userId) {
        return projectUserRepo.findAllProjectByUserId(userId);
    }

    public void assignUser(long userId, long projectId, String projectRole) {
        ProjectUserJoin assignUser = new ProjectUserJoin();

        if (!projectUserRepo.existsByUserUserIdAndProjectProjectId(userId, projectId)) {
            assignUser.setUser(userRepo.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!")));
            assignUser.setProject(projectRepo.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project with ID: " + projectId + " not found!")));
            assignUser.setUserProjectRole(ProjectUserJoin.PROJECT_ROLE.valueOf(projectRole.toUpperCase()));
            projectUserRepo.save(assignUser);
        } else {
            throw new RuntimeException("User already exists in project!");
        }
    }

    public void removeUser(long userId, long projectId) {
        ProjectUserJoin relationship = projectUserRepo.findByUserUserIdAndProjectProjectId(userId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectUserRelationship with UserID: " + userId + " and ProjectID: " + projectId + " not found!"));

        if (relationship.getUserProjectRole() == ProjectUserJoin.PROJECT_ROLE.OWNER) {
            throw new RuntimeException("Cannot delete owner of the project!");
        }

        projectUserRepo.delete(relationship);
    }

    public void deleteUser(long userId) {
        projectUserRepo.deleteAllByUserUserId(userId);
    }

    public void deleteProject(long projectId) {
        projectUserRepo.deleteAllByProjectProjectId(projectId);
    }

}
