"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { fileService } from "../lib/services/FileService";
import { projectService } from "../lib/services/ProjectService";
import { userService } from "../lib/services/UserService";
import { isAuthenticated, getCurrentUsername } from "../lib/auth/auth";
import { FileResponseDTO, ProjectResponseDTO } from "../types/types";
import {
  DownloadIcon,
  FileIcon,
  PeopleIcon,
  RepoIcon,
  TrashIcon,
  UserMinusIcon,
} from "../icons/icons";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [files, setFiles] = useState<FileResponseDTO[]>([]);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState("EDITOR");
  const [removeUserId, setRemoveUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const isCurrentUserEditor =
    currentUserId && project
      ? project.users.some(
          (user) =>
            user.userId === currentUserId &&
            (user.userRole === "OWNER" || user.userRole === "EDITOR"),
        )
      : false;

  const loadProjectData = async (id: number) => {
    try {
      const loadedProject = await projectService.getById(id);
      const loadedFiles = await fileService.getAllFilesByProject(id);
      console.log("Loaded project:", loadedProject);
      console.log("Loaded files:", loadedFiles);
      setProject(loadedProject);
      setFiles(loadedFiles);
    } catch {
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const currentUsername = getCurrentUsername();
      if (currentUsername) {
        try {
          const users = await userService.getAll();
          const currentUser = users.find(
            (user) => user.username === currentUsername,
          );
          setCurrentUserId(currentUser?.userId ?? null);
        } catch {
          setCurrentUserId(null);
        }
      }

      if (!isNaN(projectId)) {
        await loadProjectData(projectId);
      } else {
        setError("Invalid project ID.");
        setLoading(false);
      }
    };

    initializePage();
  }, [projectId]);

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");

    try {
      await Promise.all(
        Array.from(selectedFiles).map((file) =>
          fileService.uploadFile(projectId, file),
        ),
      );
      await loadProjectData(projectId);
    } catch {
      setError("File upload failed.");
    } finally {
      event.target.value = "";
    }
  };

  const downloadFile = async (fileId: number, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(projectId, fileId);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("File download failed.");
    }
  };

  const deleteProject = async () => {
    try {
      await projectService.deleteProject(projectId);
      router.push("/profile");
    } catch {
      setError("Project delete failed.");
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      await fileService.deleteFile(projectId, fileId);
      await loadProjectData(projectId);
    } catch (ex) {
      setError("File delete failed.");
      console.error("Delete file error:", ex);
    }
  };

  const assignUserToProject = async () => {
    const parsedUserId = Number(assignUserId);

    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      setError("Enter a valid user ID to assign.");
      return;
    }

    setError("");

    try {
      await projectService.assignUserToProject(
        projectId,
        parsedUserId,
        assignRole || undefined,
      );
      setAssignUserId("");
      await loadProjectData(projectId);
    } catch {
      setError("Failed to assign user to project.");
    }
  };

  const removeUserFromProject = async (userIdToRemove?: number) => {
    const parsedUserId = userIdToRemove ?? Number(removeUserId);

    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      setError("Enter a valid user ID to remove.");
      return;
    }

    setError("");

    try {
      await projectService.removeUserFromProject(projectId, parsedUserId);
      setRemoveUserId("");
      await loadProjectData(projectId);
    } catch {
      setError("Failed to remove user from project.");
    }
  };

  if (loading) {
    return (
      <main>
        <p>Loading project...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {project && (
          <>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <RepoIcon />
                <h1 className="text-xl font-semibold text-blue-400">
                  {project.projectName}
                </h1>
                <span className="text-xs px-2 py-0.5 border border-[#30363d] rounded-full text-[#8b949e]">
                  Private
                </span>
              </div>
              {isCurrentUserEditor && (
                <button
                  onClick={deleteProject}
                  className="py-1.5 px-3 text-xs font-semibold text-red-400 border border-red-800 rounded-md hover:bg-red-950/40 transition-colors"
                >
                  Delete project
                </button>
              )}
            </div>

            <div className="text-sm text-[#8b949e] border-b border-[#30363d] pb-4">
              <p>{project.projectDesc || "No description provided."}</p>
              <p className="mt-1 text-xs font-mono text-[#6e7681]">
                ID: {project.projectId}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0 space-y-4">
                <div className="border border-[#30363d] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FileIcon />
                      Files
                      <span className="text-xs font-normal text-[#8b949e]">
                        ({files.length})
                      </span>
                    </div>
                    {isCurrentUserEditor && (
                      <label className="flex items-center gap-1.5 py-1 px-3 text-xs font-semibold text-[#e6edf3] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors cursor-pointer">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8.75 1.75a.75.75 0 0 0-1.5 0V7H2.75a.75.75 0 0 0 0 1.5H7.25v5.25a.75.75 0 0 0 1.5 0V8.5h4.5a.75.75 0 0 0 0-1.5H8.75Z" />
                        </svg>
                        Add file
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={onFileChange}
                        />
                      </label>
                    )}
                  </div>

                  {files.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-[#8b949e] bg-[#0d1117]">
                      No files uploaded yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#21262d] bg-[#0d1117]">
                      {files.map((file) => (
                        <li
                          key={file.fileId}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[#161b22] transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileIcon />
                            <Link
                              href={`/projects/${projectId}/file/${file.fileId}`}
                              className="text-sm text-blue-400 truncate hover:underline"
                            >
                              {file.fileName}
                            </Link>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                downloadFile(file.fileId, file.fileName)
                              }
                              title="Download"
                              className="flex items-center gap-1 py-1 px-2 text-xs text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-md transition-colors"
                            >
                              <DownloadIcon />
                              Download
                            </button>
                            {isCurrentUserEditor && (
                              <button
                                onClick={() => deleteFile(file.fileId)}
                                title="Delete"
                                className="flex items-center gap-1 py-1 px-2 text-xs text-[#8b949e] hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
                              >
                                <TrashIcon />
                                Delete
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                <div className="border border-[#30363d] rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#30363d] text-sm font-semibold">
                    <PeopleIcon />
                    Team
                    <span className="text-xs font-normal text-[#8b949e]">
                      ({project.users.length})
                    </span>
                  </div>
                  {project.users.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-[#8b949e] bg-[#0d1117]">
                      No members yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#21262d] bg-[#0d1117]">
                      {project.users.map((user) => (
                        <li
                          key={user.userId}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[#161b22] transition-colors group"
                        >
                          <Link
                            href={
                              user.userId === currentUserId
                                ? "/profile"
                                : `/users/${user.userId}`
                            }
                            className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-[#8b949e]">
                                {user.username?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-[#e6edf3] truncate">
                                {user.username}
                              </p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 border rounded-full bg-[#21262d] text-[#8b949e] border-[#30363d]`}
                            >
                              {user.userRole}
                            </span>
                            {isCurrentUserEditor && (
                              <button
                                onClick={() =>
                                  removeUserFromProject(user.userId)
                                }
                                title="Remove user"
                                className="opacity-0 group-hover:opacity-100 p-1 text-[#8b949e] hover:text-red-400 hover:bg-red-950/30 rounded transition-all"
                              >
                                <UserMinusIcon />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {isCurrentUserEditor && (
                  <div className="border border-[#30363d] rounded-md p-4 bg-[#161b22] space-y-3">
                    <h3 className="text-sm font-semibold text-[#e6edf3]">
                      Assign user
                    </h3>
                    <div>
                      <label
                        htmlFor="assignUserId"
                        className="block text-xs text-[#8b949e] mb-1"
                      >
                        User ID
                      </label>
                      <input
                        id="assignUserId"
                        type="number"
                        value={assignUserId}
                        onChange={(e) => setAssignUserId(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        placeholder="Enter user ID"
                      />
                    </div>
                    <button
                      onClick={assignUserToProject}
                      className="w-full py-1.5 px-3 text-sm font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-950/50 border border-red-700 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
