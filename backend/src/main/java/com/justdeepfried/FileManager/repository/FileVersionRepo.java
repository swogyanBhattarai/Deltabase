package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.FileVersionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileVersionRepo extends JpaRepository<FileVersionModel, Long> {
    Optional<FileVersionModel> findByChecksum(String checksum);

    Optional<FileVersionModel> findTopByParentFileFileIdOrderByCurrentVersionDesc(long fileId);

    List<FileVersionModel> findTop2ByParentFileFileIdOrderByCurrentVersionDesc(long fileId);

    Optional<FileVersionModel> findByParentFileFileIdAndCurrentVersion(long fileId, long currentVersion);

    List<FileVersionModel> findAllByParentFileFileId(long fileId);
}
