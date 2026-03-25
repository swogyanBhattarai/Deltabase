package com.justdeepfried.FileManager.dto.file;

import com.justdeepfried.FileManager.model.FileModel;

import java.time.LocalDateTime;
import java.util.List;

public record FileResponse (
        Long fileId,
        String fileName,
        FileProjectResponse parentProject,
        List<FileVersionResponse> fileVersions,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FileResponse from(FileModel file) {
        return new FileResponse(
                file.getFileId(),
                file.getFileName(),
                FileProjectResponse.from(file.getParentProject()),
                file.getVersions()
                        .stream()
                        .map(FileVersionResponse::from)
                        .toList(),
                file.getCreatedAt(),
                file.getUpdatedAt()
        );
    }
}
