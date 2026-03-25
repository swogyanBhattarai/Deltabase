package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.FileModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepo extends JpaRepository<FileModel, Long> {
    List<FileModel> findAllByParentProjectProjectId(long projectId);
    Optional<FileModel> findByFileId(long fileId);
    Optional<FileModel> findByFileNameAndParentProjectProjectId(String fileName, long projectId);
}
