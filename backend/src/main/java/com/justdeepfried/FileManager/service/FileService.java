package com.justdeepfried.FileManager.service;

import com.justdeepfried.FileManager.dto.file.DiffLine;
import com.justdeepfried.FileManager.dto.file.DiffResponse;
import com.justdeepfried.FileManager.dto.file.FileResponse;
import com.justdeepfried.FileManager.dto.file.FileVersionResponse;
import com.justdeepfried.FileManager.model.FileModel;
import com.justdeepfried.FileManager.model.FileVersionModel;
import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.repository.FileRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepo fileRepo;
    private final ProjectService projectService;
    private final FileVersionService fileVersionService;

    public List<FileResponse> getAllByProjectId(long projectId) {
        return fileRepo.findAllByParentProjectProjectId(projectId).stream().map(FileResponse::from).toList();
    }

    public List<FileVersionResponse> getAllVersionsByFileId(long fileId)  {
        return fileVersionService.getAllFileVersions(fileId);
    }

    public FileResponse getByFileId(long fileId) {
        return FileResponse.from(fileRepo.findByFileId(fileId).orElseThrow(() -> new ResourceNotFoundException("File with ID: " + fileId + " not found!")));
    }

    @Transactional
    @PreAuthorize("hasPermission(#projectId, 'PROJECT', 'POST')")
    public void uploadFile(long projectId, MultipartFile file) {
        ProjectModel project = projectService.getProjectByIdModel(projectId);
        String latestChecksum = null;
        String fileChecksum = null;
        byte[] fileBytes = null;

        FileModel newFile = fileRepo.findByFileNameAndParentProjectProjectId(file.getOriginalFilename(), projectId)
                .orElseGet(() -> {
                    FileModel file2 = new FileModel();
                    file2.setFileName(file.getOriginalFilename());
                    file2.setParentProject(project);
                    return fileRepo.save(file2);
                });

        Long currentVersion = fileVersionService.getCurrentVersion(newFile.getFileId());

        FileVersionModel fileVersionModel = getLatestOrNull(newFile.getFileId());

        if (fileVersionModel != null) {
            latestChecksum = fileVersionModel.getChecksum();
        }

        try {
            fileBytes = file.getBytes();
            fileChecksum = fileVersionService.generateChecksum(fileBytes);
            if (!fileChecksum.equals(latestChecksum)) {
                fileVersionService.createVersion(file.getBytes(), newFile, currentVersion);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<byte[]> downloadFile(long projectId, long fileId) {
        ProjectModel project = projectService.getProjectByIdModel(projectId);
        FileVersionModel downloadVersion = getLatestOrNull(fileId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadVersion.getParentFile().getFileName() + "\"")
                .contentLength(downloadVersion.getBlob().length)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(downloadVersion.getBlob());
    }

    public FileVersionModel getLatestOrNull(long fileId) {
        return fileVersionService.getCurrentVersionModel(fileId)
                .orElse(null);
    }

    public DiffResponse getDiffLines(long fileId) {
        return fileVersionService.generateDiff(fileId);
    }

    @PreAuthorize("hasPermission(#projectId, 'PROJECT', 'DELETE')")
    @Transactional
    public String deleteFileById(long projectId, long fileId) {
        FileModel file = fileRepo.findById(fileId).orElseThrow(() -> new ResourceNotFoundException("File with ID: " + fileId + " not found!"));
        fileRepo.delete(file);
        return "File deleted successfully!";
    }

}
