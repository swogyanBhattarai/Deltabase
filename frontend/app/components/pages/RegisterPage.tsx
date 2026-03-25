"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userService } from "../lib/services/UserService";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rolesInput, setRolesInput] = useState("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const roles = rolesInput
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);

    try {
      await userService.register({ username, password, roles });
      router.push("/login");
    } catch {
      setError("Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4 py-12 text-[#e6edf3] text-sm font-sans">
      <h1 className="text-2xl font-light mb-1">Create account</h1>
      <p className="text-sm text-[#8b949e] mb-5">
        Join and start managing your projects.
      </p>

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
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1.5 font-semibold text-[#e6edf3]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="roles"
              className="block mb-1.5 font-semibold text-[#e6edf3]"
            >
              Roles (comma separated)
            </label>
            <input
              id="roles"
              value={rolesInput}
              onChange={(event) => setRolesInput(event.target.value)}
              className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 px-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
          >
            {loading ? "Registering..." : "Sign up"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-[340px] text-center border border-[#30363d] rounded-md py-4 text-[#e6edf3]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:underline font-medium"
        >
          Sign in
        </Link>
        .
      </div>
    </main>
  );
}
