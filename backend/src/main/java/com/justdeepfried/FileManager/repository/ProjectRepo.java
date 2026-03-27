package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.ProjectModel;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.NamedSubgraph;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@NamedEntityGraph(
        name = "project.file.version",
        attributeNodes = @NamedAttributeNode(value = "files", subgraph = "file.version"),
        subgraphs = {
                @NamedSubgraph(
                        name = "file.version",
                        attributeNodes = @NamedAttributeNode(value = "versions")
                )
        }
)

public interface ProjectRepo extends JpaRepository<ProjectModel, Long>, JpaSpecificationExecutor<ProjectModel> {
    @NonNull
    @EntityGraph("project.file.version")
    Optional<ProjectModel> findById(long id);
}
