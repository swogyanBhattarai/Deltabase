package com.justdeepfried.FileManager.security.permission;

import com.justdeepfried.FileManager.security.user.UserPrincipal;

public interface PermissionInterface<T> {
    boolean hasPermission(UserPrincipal userPrincipal, T target, String permission);
}
