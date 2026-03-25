package com.justdeepfried.FileManager.service;

import com.justdeepfried.FileManager.dto.PageResponse;
import com.justdeepfried.FileManager.dto.project.ProjectCreate;
import com.justdeepfried.FileManager.dto.project.ProjectResponse;
import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.repository.ProjectRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import com.justdeepfried.FileManager.specification.ProjectSpecification;
import com.justdeepfried.FileManager.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepo projectRepo;
    private final UserService userService;
    private final ProjectUserJoinService projectUserJoinService;

    public List<ProjectResponse> findAllProjectsByUser(long userId) {
        return projectUserJoinService.findAllProjectsByUserId(userId)
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    public ProjectResponse getProjectById(long projectId) {
        return ProjectResponse.from(projectRepo.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project with ID: " + projectId + " not found!")));
    }

    public ProjectModel getProjectByIdModel(long projectId) {
        return projectRepo.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project with ID: " + projectId + " not found!"));
    }

    public PageResponse<ProjectResponse> searchProject(String search, Pageable pageable) {
        Specification<ProjectModel> spec = ProjectSpecification.getSpecification(search);
        return PageResponse.from(projectRepo.findAll(spec, pageable).map(ProjectResponse::from));
    }

    @Transactional
    public ResponseEntity<ProjectResponse> createProject(ProjectCreate project) {
        UserModel currentUser = userService.getCurrentUser();

        ProjectModel newProject = new ProjectModel();

        newProject.setProjectName(project.projectName());
        newProject.setProjectDesc(project.projectDesc());

        ProjectModel save = projectRepo.save(newProject);

        if (currentUser != null) {
            assignUserToProject(currentUser.getUserId(), save.getProjectId(), "OWNER");
        }

        return ResponseEntity.ok(ProjectResponse.from(save));
    }

    @PreAuthorize("hasPermission(#projectId, 'PROJECT', 'PUT')")
    public void assignUserToProject(long userId, long projectId, String role) {
        projectUserJoinService.assignUser(userId, projectId, role);
    }

    @PreAuthorize("hasPermission(#projectId, 'PROJECT', 'PUT')")
    public void removeUserFromProject(long userId, long projectId) {
        projectUserJoinService.removeUser(userId, projectId);
    }

    @Transactional
    @PreAuthorize("hasPermission(#projectId, 'PROJECT', 'DELETE')")
    public void deleteProject(long projectId) {
        projectUserJoinService.deleteProject(projectId);
        ProjectModel project = projectRepo.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project with ID: " + projectId + " not found!"));
        projectRepo.delete(project);
    }

}
