package com.justdeepfried.FileManager.security.permission;

import com.justdeepfried.FileManager.model.FileModel;
import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final UserHandler userHandler;
    private final ProjectHandler projectHandler;
    private final FileHandler fileHandler;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        switch (targetType) {
            case "USER":
                UserModel user = userHandler.getById(Long.parseLong(targetId.toString()));
                return userHandler.hasPermission(userPrincipal, user, permission.toString());
            case "PROJECT":
                ProjectModel project = projectHandler.getById(Long.parseLong(targetId.toString()));
                return projectHandler.hasPermission(userPrincipal, project, permission.toString());
            case "FILE":
                FileModel file = fileHandler.getById(Long.parseLong(targetId.toString()));
                return fileHandler.hasPermission(userPrincipal, file, permission.toString());
            default:
                return false;
        }
    }
}
