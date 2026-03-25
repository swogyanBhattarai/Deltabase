package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.ProjectModel;
import com.justdeepfried.FileManager.model.ProjectUserJoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectUserRepo extends JpaRepository<ProjectUserJoin, Long> {
    @Query("""
    SELECT pu.project FROM ProjectUserJoin pu
    WHERE pu.user.userId = :userId
    """)
    List<ProjectModel> findAllProjectByUserId(@Param("userId") long userId);

    List<ProjectUserJoin> findAllByUserUserId(long userId);

    void deleteAllByUserUserId(long userId);

    void deleteAllByProjectProjectId(long projectId);

    Optional<ProjectUserJoin> findByUserUserIdAndProjectProjectId(long userId, long projectId);

    boolean existsByUserUserIdAndProjectProjectId(long userId, long projectId);

}
