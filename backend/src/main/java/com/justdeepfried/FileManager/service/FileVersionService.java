package com.justdeepfried.FileManager.service;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.Patch;
import com.justdeepfried.FileManager.dto.file.DiffLine;
import com.justdeepfried.FileManager.dto.file.DiffResponse;
import com.justdeepfried.FileManager.dto.file.FileVersionResponse;
import com.justdeepfried.FileManager.model.FileModel;
import com.justdeepfried.FileManager.model.FileVersionModel;
import com.justdeepfried.FileManager.repository.FileVersionRepo;
import com.justdeepfried.FileManager.security.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FileVersionService {

    private final FileVersionRepo fileVersionRepo;

    public List<FileVersionResponse> getAllFileVersions(long fileId) {
        return fileVersionRepo.findAllByParentFileFileId(fileId).stream().map(FileVersionResponse::from).toList();
    }

    public void createVersion(byte[] blob, FileModel file, long currentVersion) {
        FileVersionModel version = new FileVersionModel();
        String checksum = generateChecksum(blob);

        version.setBlob(blob);
        version.setCurrentVersion(currentVersion + 1);
        version.setChecksum(checksum);
        version.setParentFile(file);
        fileVersionRepo.save(version);
    }

    public String generateChecksum(byte[] blob){
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(blob);
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public Long getCurrentVersion(long fileId) {
        return fileVersionRepo
                .findTopByParentFileFileIdOrderByCurrentVersionDesc(fileId)
                .map(FileVersionModel::getCurrentVersion)
                .orElse(0L);
    }

    public DiffResponse generateDiff(long fileId) {
        List<FileVersionModel> latestTwo = fileVersionRepo.findTop2ByParentFileFileIdOrderByCurrentVersionDesc(fileId);

        if (latestTwo.size() < 2) {
            throw new ResourceNotFoundException("Not enough versions to compare!");
        }

        String originalText = new String(latestTwo.get(1).getBlob(), StandardCharsets.UTF_8);
        String updatedText = new String(latestTwo.get(0).getBlob(), StandardCharsets.UTF_8);

        List<String> originalArr = Arrays.asList(originalText.split("\\R"));
        List<String> updatedArr = Arrays.asList(updatedText.split("\\R"));

        List<DiffLine> diff = DiffLine.from(DiffUtils.diff(originalArr, updatedArr));

        return DiffResponse.from(diff, originalArr, updatedArr);
    }


    public Optional<FileVersionModel> getCurrentVersionModel(long fileId) {
        return fileVersionRepo.findTopByParentFileFileIdOrderByCurrentVersionDesc(fileId);
    }

}
