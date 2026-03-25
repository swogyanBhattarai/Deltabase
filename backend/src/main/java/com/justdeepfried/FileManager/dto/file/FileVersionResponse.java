package com.justdeepfried.FileManager.dto.file;

import com.justdeepfried.FileManager.model.FileVersionModel;

import java.time.LocalDateTime;

public record FileVersionResponse (
        Long versionId,
        Long version,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FileVersionResponse from(FileVersionModel fileVersion) {
        return new FileVersionResponse(
                fileVersion.getVersionId(),
                fileVersion.getCurrentVersion(),
                fileVersion.getCreatedAt(),
                fileVersion.getUpdatedAt()
        );
    }
}
