package com.justdeepfried.FileManager.dto.file;

import com.github.difflib.patch.Patch;

import java.util.List;

public record DiffLine (
        String type,
        int sourcePos,
        int targetPos,
        List<String> source,
        List<String> target
) {
    public static List<DiffLine> from(Patch<String> patch) {
        return patch.getDeltas().stream()
                .map(delta -> new DiffLine(
                        delta.getType().toString(),
                        delta.getSource().getPosition(),
                        delta.getTarget().getPosition(),
                        delta.getSource().getLines(),
                        delta.getTarget().getLines()
                ))
                .toList();
    }
}
