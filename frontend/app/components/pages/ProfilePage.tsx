"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  removeToken,
  getCurrentUsername,
} from "../lib/auth/auth";
import { projectService } from "../lib/services/ProjectService";
import { userService } from "../lib/services/UserService";
import { ProjectResponseDTO, UserResponseDTO } from "../types/types";
import { RepoIcon } from "../icons/icons";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [projects, setProjects] = useState<ProjectResponseDTO[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const loadData = async () => {
    setError("");

    try {
      const username = getCurrentUsername();
      if (!username) {
        router.push("/login");
        return;
      }

      const users = await userService.getAll();
      const currentUser = users.find(
        (singleUser) => singleUser.username === username,
      );

      if (!currentUser) {
        setError("Could not resolve current user from token subject.");
        return;
      }

      setUser(currentUser);

      const userProjects = await projectService.getAllProjectsByUser(
        currentUser.userId,
      );
      setProjects(userProjects);
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    loadData();
  }, []);

  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const createdProject = await projectService.createProject({
        projectName,
        projectDesc,
      });
      router.push(`/projects/${createdProject.projectId}`);
    } catch {
      setError("Project creation failed.");
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      await userService.deleteUser(user.userId);
      removeToken();
      router.push("/register");
    } catch {
      setError("Failed to delete account.");
    }
  };

  const logout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600">Loading profile...</p>
        </div>
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

            <Link
              href="/profile/update"
              className="block w-full py-1.5 px-3 text-sm font-semibold bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors text-[#e6edf3] mb-4 text-center"
            >
              Edit profile
            </Link>

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

            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5">
              <h2 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
                <RepoIcon />
                Create new project
              </h2>
              <form onSubmit={createProject} className="space-y-3">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-xs font-semibold text-[#e6edf3] mb-1"
                  >
                    Project name
                  </label>
                  <input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-sm bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="projectDesc"
                    className="block text-xs font-semibold text-[#e6edf3] mb-1"
                  >
                    Description{" "}
                    <span className="text-[#6e7681] font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="projectDesc"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-4 text-sm font-semibold bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
                >
                  Create project
                </button>
              </form>
            </div>

            <div className="bg-[#161b22] border border-red-900/50 rounded-md p-5">
              <h2 className="text-sm font-semibold text-red-400 mb-3">
                Danger zone
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e6edf3] font-medium">
                    Delete this account
                  </p>
                  <p className="text-xs text-[#8b949e] mt-0.5">
                    Once deleted, there is no going back.
                  </p>
                </div>
                <button
                  onClick={deleteAccount}
                  className="py-1.5 px-3 text-xs font-semibold text-red-400 border border-red-700 rounded-md hover:bg-red-950/40 transition-colors"
                >
                  Delete account
                </button>
              </div>
            </div>

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
