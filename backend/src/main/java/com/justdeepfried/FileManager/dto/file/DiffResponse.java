package com.justdeepfried.FileManager.dto.file;

import java.util.List;

public record DiffResponse (
        List<String> original,
        List<String> updated,
        List<DiffLine> diff
) {
    public static DiffResponse from(List<DiffLine> diff, List<String> original, List<String> updated) {
        return new DiffResponse(
                original,
                updated,
                diff
        );
    }
}
