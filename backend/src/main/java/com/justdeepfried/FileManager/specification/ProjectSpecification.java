package com.justdeepfried.FileManager.specification;

import com.justdeepfried.FileManager.model.ProjectModel;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProjectSpecification {
    public static Specification<ProjectModel> getSpecification(String search) {
        return new Specification<ProjectModel>() {
            @Override
            public @Nullable Predicate toPredicate(Root<ProjectModel> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
                Predicate searchPredicate;
                List<Predicate> lists = new ArrayList<>();

                if (search != null) {
                    lists.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("projectName")), "%" +search.toLowerCase()+ "%"));
                }

                if (search == null) {
                    return criteriaBuilder.conjunction();
                }

                searchPredicate = criteriaBuilder.or(lists.toArray(new Predicate[0]));

                return criteriaBuilder.and(searchPredicate);
            }
        };
    }
}
