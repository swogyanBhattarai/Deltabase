package com.justdeepfried.FileManager.dto.user;

import java.util.List;

public record UserCreate (
        String username,
        String password,
        List<String> roles
) {
}
