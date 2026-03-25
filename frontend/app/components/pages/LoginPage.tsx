"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../lib/services/AuthService";
import { removeToken } from "../lib/auth/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    removeToken();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ username, password });
      router.push("/profile");
    } catch {
      setError("Login failed. Check username/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4 py-12 text-[#e6edf3] text-sm font-sans">
      <h1 className="text-2xl font-light mb-5">Sign in</h1>

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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="font-semibold text-[#e6edf3]"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 px-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-[340px] text-center border border-[#30363d] rounded-md py-4 text-[#e6edf3]">
        No account?{" "}
        <Link
          href="/register"
          className="text-blue-400 hover:underline font-medium"
        >
          Create one
        </Link>
        .
      </div>
    </main>
  );
}
