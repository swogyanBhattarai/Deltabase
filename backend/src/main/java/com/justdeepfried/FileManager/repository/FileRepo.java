package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.FileModel;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@NamedEntityGraph(
        name = "file.version",
        attributeNodes = @NamedAttributeNode(value = "versions")
)
public interface FileRepo extends JpaRepository<FileModel, Long> {
    @EntityGraph("file.version")
    List<FileModel> findAllByParentProjectProjectId(long projectId);
    @EntityGraph("file.version")
    Optional<FileModel> findByFileId(long fileId);
    @EntityGraph("file.version")
    Optional<FileModel> findByFileNameAndParentProjectProjectId(String fileName, long projectId);
}
