package com.justdeepfried.FileManager.security.permission;

import com.justdeepfried.FileManager.model.UserModel;
import com.justdeepfried.FileManager.repository.UserRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import com.justdeepfried.FileManager.security.user.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserHandler implements PermissionInterface<UserModel> {

    private final UserRepo repo;

    @Override
    public boolean hasPermission(UserPrincipal userPrincipal, UserModel target, String permission) {
        UserModel user = repo.findByUsername(userPrincipal.getUsername());
        switch (permission) {
            case "GET":
                return true;
            case "POST", "DELETE", "PUT":
                return (user.getUserId().equals(target.getUserId()) || userPrincipal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
            default:
                return false;
        }
    }

    public UserModel getById(long userId) {
        return repo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with ID: " + userId + " not found!"));
    }
}
