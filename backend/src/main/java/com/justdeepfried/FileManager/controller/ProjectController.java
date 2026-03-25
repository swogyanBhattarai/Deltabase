package com.justdeepfried.FileManager.controller;

import com.justdeepfried.FileManager.dto.PageResponse;
import com.justdeepfried.FileManager.dto.project.ProjectCreate;
import com.justdeepfried.FileManager.dto.project.ProjectResponse;
import com.justdeepfried.FileManager.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByUser(@PathVariable long userId) {
        return ResponseEntity.ok(projectService.findAllProjectsByUser(userId));
    }

    @GetMapping("/{projectId:\\d+}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @GetMapping("/search")
    public PageResponse<ProjectResponse> searchUsers(
            @RequestParam(required = false, defaultValue = "1") int pageNum,
            @RequestParam(required = false, defaultValue = "10") int pageSize,
            @RequestParam(required = false, defaultValue = "projectId") String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Sort sort = null;

        if (sortDir.equalsIgnoreCase("ASC")) {
            sort = Sort.by(sortBy).ascending();
        } else {
            sort = Sort.by(sortBy).descending();
        }

        return projectService.searchProject(search, PageRequest.of(pageNum - 1, pageSize, sort));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectCreate projectCreate) {
        return projectService.createProject(projectCreate);
    }

    @PostMapping("/{projectId}/assign/{userId}")
    public ResponseEntity<String> assignUserToProject(
            @PathVariable long projectId,
            @PathVariable long userId,
            @RequestParam(defaultValue = "EDITOR") String role
    ) {
        projectService.assignUserToProject(userId, projectId, role);
        return ResponseEntity.ok("User assigned to project successfully!");
    }

    @DeleteMapping("/{projectId}/remove/{userId}")
    public ResponseEntity<String> removeUserFromProject(
            @PathVariable long projectId,
            @PathVariable long userId
    ) {
        projectService.removeUserFromProject(userId, projectId);
        return ResponseEntity.ok("User removed from project successfully!");
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<String> deleteProject(@PathVariable long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok("Project deleted successfully!");
    }
}
