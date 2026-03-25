package com.justdeepfried.FileManager.dto.user;

import java.util.List;

public record UserUpdate (
        String username,
        List<String> roles
) {
}
