package com.justdeepfried.FileManager.controller;

import com.justdeepfried.FileManager.dto.file.DiffResponse;
import com.justdeepfried.FileManager.dto.file.FileResponse;
import com.justdeepfried.FileManager.dto.file.FileVersionResponse;
import com.justdeepfried.FileManager.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/projects/{projectId}/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping
    public ResponseEntity<List<FileResponse>> getAllFilesInProject(@PathVariable long projectId) {
        return ResponseEntity.ok(fileService.getAllByProjectId(projectId));
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileResponse> getFileById(@PathVariable long fileId) {
        return ResponseEntity.ok(fileService.getByFileId(fileId));
    }

    @GetMapping("/{fileId}/diff")
    public ResponseEntity<DiffResponse> getFileDiff(@PathVariable long fileId) {
        return ResponseEntity.ok(fileService.getDiffLines(fileId));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @PathVariable long projectId,
            @RequestParam("file") MultipartFile file
    ) {
        fileService.uploadFile(projectId, file);
        return ResponseEntity.ok("File uploaded successfully!");
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable long projectId,
            @PathVariable long fileId
    ) {
        return fileService.downloadFile(projectId, fileId);
    }

    @GetMapping("/{fileId}/versions")
    public ResponseEntity<List<FileVersionResponse>> getAllVersionsByFileId(@PathVariable long fileId) {
        return ResponseEntity.ok(fileService.getAllVersionsByFileId(fileId));
    }

    @DeleteMapping("/{fileId}/delete")
    public ResponseEntity<String> deleteFileById(@PathVariable long projectId, @PathVariable long fileId) {
        return ResponseEntity.ok(fileService.deleteFileById(projectId, fileId));
    }

}
