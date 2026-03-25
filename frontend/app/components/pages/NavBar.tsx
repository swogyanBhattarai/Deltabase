"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getCurrentUsername,
  isAuthenticated,
  removeToken,
} from "../lib/auth/auth";
import api from "../lib/api";
import {
  PageResponse,
  UserResponseDTO,
  ProjectResponseDTO,
} from "../types/types";
import { userService } from "../lib/services/UserService";
import { projectService } from "../lib/services/ProjectService";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [isUserSearchFocused, setIsUserSearchFocused] = useState(false);
  const [isProjectSearchFocused, setIsProjectSearchFocused] = useState(false);

  const [userResults, setUserResults] = useState<UserResponseDTO[]>([]);
  const [projectResults, setProjectResults] = useState<ProjectResponseDTO[]>(
    [],
  );
  const [userTotalElements, setUserTotalElements] = useState(0);
  const [projectTotalElements, setProjectTotalElements] = useState(0);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  const syncAuthState = () => {
    const authed = isAuthenticated();
    setAuthenticated(authed);
    setUsername(authed ? getCurrentUsername() : null);
  };

  useEffect(() => {
    syncAuthState();
  }, [pathname]);

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        syncAuthState();
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Debounced user search
  useEffect(() => {
    if (!userQuery.trim()) {
      setUserResults([]);
      setUserTotalElements(0);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsUserLoading(true);
      try {
        const response = await userService.searchUserNavbar(userQuery, 1, 10);
        setUserResults(response.content);
        setUserTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserResults([]);
        setUserTotalElements(0);
      } finally {
        setIsUserLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userQuery]);

  // Debounced project search
  useEffect(() => {
    if (!projectQuery.trim()) {
      setProjectResults([]);
      setProjectTotalElements(0);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsProjectLoading(true);
      try {
        const response = await projectService.searchProjectNavbar(projectQuery, 1, 10);
        setProjectResults(response.content);
        setProjectTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error searching projects:", error);
        setProjectResults([]);
        setProjectTotalElements(0);
      } finally {
        setIsProjectLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [projectQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserSearchFocused(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    removeToken();
    setAuthenticated(false);
    setUsername(null);
    router.push("/login");
  };

  const handleUserSelect = (userId: number) => {
    setIsUserSearchFocused(false);
    setUserQuery("");
    router.push(`/users/${userId}`);
  };

  const handleProjectSelect = (projectId: number) => {
    setIsProjectSearchFocused(false);
    setProjectQuery("");
    router.push(`/projects/${projectId}`);
  };

  const handleShowAllUsers = () => {
    setIsUserSearchFocused(false);
    router.push(`/users/search?q=${encodeURIComponent(userQuery)}`);
  };

  const handleShowAllProjects = () => {
    setIsProjectSearchFocused(false);
    router.push(`/projects/search?q=${encodeURIComponent(projectQuery)}`);
  };

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const showUserDropdown =
    isUserSearchFocused &&
    userQuery.trim() &&
    (userResults.length > 0 || isUserLoading);
  const showProjectDropdown =
    isProjectSearchFocused &&
    projectQuery.trim() &&
    (projectResults.length > 0 || isProjectLoading);

  return (
    <header className="bg-black border-b border-zinc-800 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <div className="flex-shrink-0">
          {username ? (
            <Link
              href="/profile"
              className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
            >
              {username}
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
            >
              Home
            </Link>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs" ref={userDropdownRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"></div>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onFocus={() => setIsUserSearchFocused(true)}
              placeholder="Search users..."
              className={`w-full pl-2 pr-8 py-1.5 text-sm bg-zinc-900 border rounded-md text-white placeholder-zinc-500 focus:outline-none transition-all ${
                isUserSearchFocused
                  ? "border-blue-500 ring-2 ring-blue-500/30 bg-black"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            />
            {!isUserSearchFocused && !userQuery && (
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
                  /
                </kbd>
              </div>
            )}

            {showUserDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden z-50">
                {isUserLoading ? (
                  <div className="px-3 py-2 text-sm text-zinc-400">
                    Searching...
                  </div>
                ) : (
                  <>
                    {userResults.map((user) => (
                      <button
                        key={user.userId}
                        onClick={() => handleUserSelect(user.userId)}
                        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-zinc-800 transition-colors"
                      >
                        {user.username}
                      </button>
                    ))}
                    {userTotalElements > 10 && (
                      <button
                        onClick={handleShowAllUsers}
                        className="w-full px-3 py-2 text-sm text-left text-blue-400 hover:bg-zinc-800 border-t border-zinc-700 transition-colors"
                      >
                        Show all ({userTotalElements} results)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1  justify-center">
          <div className="relative w-full max-w-xs" ref={projectDropdownRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"></div>
            <input
              type="text"
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              onFocus={() => setIsProjectSearchFocused(true)}
              placeholder="Search projects..."
              className={`w-full pl-2 pr-8 py-1.5 text-sm bg-zinc-900 border rounded-md text-white placeholder-zinc-500 focus:outline-none transition-all ${
                isProjectSearchFocused
                  ? "border-blue-500 ring-2 ring-blue-500/30 bg-black"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            />
            {!isProjectSearchFocused && !projectQuery && (
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
                  /
                </kbd>
              </div>
            )}

            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden z-50">
                {isProjectLoading ? (
                  <div className="px-3 py-2 text-sm text-zinc-400">
                    Searching...
                  </div>
                ) : (
                  <>
                    {projectResults.map((project) => (
                      <button
                        key={project.projectId}
                        onClick={() => handleProjectSelect(project.projectId)}
                        className="w-full px-3 py-2 text-sm text-left text-white hover:bg-zinc-800 transition-colors"
                      >
                        {project.projectName}
                      </button>
                    ))}
                    {projectTotalElements > 10 && (
                      <button
                        onClick={handleShowAllProjects}
                        className="w-full px-3 py-2 text-sm text-left text-blue-400 hover:bg-zinc-800 border-t border-zinc-700 transition-colors"
                      >
                        Show all ({projectTotalElements} results)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          {authenticated ? (
            <>
              <button
                onClick={logout}
                className="py-1.5 px-3 text-sm font-semibold text-white bg-black border border-zinc-700 rounded-md hover:bg-zinc-900 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="py-1.5 px-3 text-sm font-semibold text-white bg-black border border-zinc-700 rounded-md hover:bg-zinc-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="py-1.5 px-3 text-sm font-semibold text-white bg-black border border-zinc-700 rounded-md hover:bg-zinc-900 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
