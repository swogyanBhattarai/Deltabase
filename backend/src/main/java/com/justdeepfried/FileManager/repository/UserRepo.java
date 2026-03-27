package com.justdeepfried.FileManager.repository;

import com.justdeepfried.FileManager.model.UserModel;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@NamedEntityGraph(
        name = "user.project",
        attributeNodes = @NamedAttributeNode("projects")
)
public interface UserRepo extends JpaRepository<UserModel, Long>, JpaSpecificationExecutor<UserModel> {
    UserModel findByUsername(String username);

    @Override
    @NonNull
    @EntityGraph("user.project")
    List<UserModel> findAll();
}
