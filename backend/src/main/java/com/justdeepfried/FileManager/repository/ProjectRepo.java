package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.ProjectModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepo extends JpaRepository<ProjectModel, Long>, JpaSpecificationExecutor<ProjectModel> {
}
