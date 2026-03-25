"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectService } from "../lib/services/ProjectService";
import { userService } from "../lib/services/UserService";
import { ProjectResponseDTO, UserResponseDTO } from "../types/types";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUsername, isAuthenticated } from "../lib/auth/auth";
import { RepoIcon } from "../icons/icons";

export default function UserProfilePage() {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [projects, setProjects] = useState<ProjectResponseDTO[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.userId);

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAuthenticated()) {
          const currentUsername = getCurrentUsername();
          if (currentUsername) {
            const users = await userService.getAll();
            const currentUser = users.find(
              (singleUser) => singleUser.username === currentUsername,
            );
            if (currentUser?.userId === userId) {
              router.replace("/profile");
              return;
            }
          }
        }

        const loadedUser = await userService.getById(userId);
        const loadedProjects =
          await projectService.getAllProjectsByUser(userId);

        setUser(loadedUser);
        setProjects(loadedProjects);
      } catch {
        setError(
          "Failed to load this user profile. Backend may require login for this endpoint.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, userId]);

  if (loading) {
    return (
      <main>
        <p>Loading user profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="w-full aspect-square rounded-full bg-[#21262d] border-2 border-[#30363d] flex items-center justify-center mb-4 overflow-hidden">
              <span className="text-5xl font-bold text-[#8b949e]">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>

            <h1 className="text-xl font-bold text-[#e6edf3]">
              {user?.username ?? "username"}
            </h1>
            <p className="text-[#8b949e] text-sm mb-4">
              @{user?.username ?? "username"}
            </p>

            <div className="space-y-2 text-sm text-[#8b949e] border-t border-[#30363d] pt-4">
              <div>
                <span className="text-xs uppercase tracking-wide text-[#6e7681]">
                  User ID
                </span>
                <p className="text-[#e6edf3] font-mono text-xs mt-0.5 truncate">
                  {user?.userId ?? "—"}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-[#6e7681]">
                  Roles
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(user?.roles ?? []).map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 text-xs bg-[#388bfd1a] text-blue-400 border border-blue-900 rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3]">
                All projects
              </div>
            </div>

            {projects?.length === 0 ? (
              <p className="text-sm text-[#8b949e]">
                No projects yet. Create your first one below.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(projects ?? []).map((project, i) => (
                  <Link
                    key={project.projectId}
                    href={`/projects/${project.projectId}`}
                    className="flex flex-col justify-between p-4 bg-[#161b22] border border-[#30363d] rounded-md group h-32"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <RepoIcon />
                        <span className="text-sm font-semibold text-blue-400 group-hover:underline truncate">
                          {project.projectName}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                        {project.projectDesc || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors[i % colors.length] }}
                      />
                      <span className="text-xs text-[#8b949e]">Project</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-red-950/50 border border-red-700 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
