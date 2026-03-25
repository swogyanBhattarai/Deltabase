package com.justdeepfried.FileManager.security.permission;

import com.justdeepfried.FileManager.model.FileModel;
import com.justdeepfried.FileManager.model.ProjectUserJoin;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.repository.FileRepo;
import com.justdeepfried.FileManager.repository.ProjectUserRepo;
import com.justdeepfried.FileManager.repository.UserRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import com.justdeepfried.FileManager.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FileHandler implements PermissionInterface<FileModel> {

    private final UserRepo userRepo;
    private final FileRepo fileRepo;
    private final ProjectUserRepo projectUserRepo;

    @Override
    public boolean hasPermission(UserPrincipal userPrincipal, FileModel target, String permission) {
        UserModel user = userRepo.findByUsername(userPrincipal.getUsername());
        ProjectUserJoin projectUser = projectUserRepo.findByUserUserIdAndProjectProjectId(user.getUserId(), target.getParentProject().getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("ProjectUserRelationship with UserID: " + user.getUserId() + " and ProjectID: " + target.getParentProject().getProjectId() + " not found!"));
        switch (permission) {
            case "GET":
                return true;
            case "POST", "DELETE", "PUT":
                return (projectUser.getUserProjectRole().equals(ProjectUserJoin.PROJECT_ROLE.OWNER) || projectUser.getUserProjectRole().equals(ProjectUserJoin.PROJECT_ROLE.EDITOR) || isAdmin(userPrincipal));
            default:
                return false;
        }
    }

    private boolean isAdmin(UserPrincipal userPrincipal) {
        return userPrincipal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    public FileModel getById(long fileId) {
        return fileRepo.findByFileId(fileId).orElseThrow(() -> new ResourceNotFoundException("File with ID: " + fileId + " not found!"));
    }
}
