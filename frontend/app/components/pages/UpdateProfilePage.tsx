"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUsername,
  isAuthenticated,
  removeToken,
} from "../lib/auth/auth";
import { userService } from "../lib/services/UserService";
import { UserResponseDTO } from "../types/types";

export default function UpdateProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const tokenUsername = getCurrentUsername();
        if (!tokenUsername) {
          router.push("/login");
          return;
        }

        const users = await userService.getAll();
        const currentUser = users.find(
          (singleUser) => singleUser.username === tokenUsername,
        );

        if (!currentUser) {
          setError("Could not resolve current user.");
          return;
        }

        setUser(currentUser);
        setUsername(currentUser.username);
      } catch {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await userService.updateUser(user.userId, { username: trimmedUsername });

      if (trimmedUsername !== user.username) {
        removeToken();
        router.push("/login");
        return;
      }

      router.push("/profile");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 text-[#e6edf3]">
        <p className="text-sm text-[#8b949e]">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4 py-12 text-[#e6edf3] text-sm font-sans">
      <h1 className="text-2xl font-light mb-5">Update profile</h1>

      {error && (
        <div className="w-full max-w-[340px] mb-4 px-4 py-3 bg-red-950/50 border border-red-700 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-[340px] bg-[#161b22] border border-[#30363d] rounded-md p-5 mb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-1.5 font-semibold text-[#e6edf3]"
            >
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-1.5 px-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
          >
            {saving ? "Saving..." : "Update profile"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-[340px] text-center border border-[#30363d] rounded-md py-4 text-[#e6edf3]">
        Back to{" "}
        <Link
          href="/profile"
          className="text-blue-400 hover:underline font-medium"
        >
          profile
        </Link>
        .
      </div>
    </main>
  );
}
