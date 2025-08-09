import { useMutation } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { LOGIN } from "../../graphql/mutations";
import { useAuth } from "../../auth/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    twoFactorCode: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const [doLogin, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.accessToken, data.login.user);
      navigate("/admin", { replace: true }); // ✅ no reload
    },
    onError: (err) => setErrorMsg(err.message || "Login failed"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    doLogin({
      variables: {
        input: {
          username: form.username,
          password: form.password,
          twoFactorCode: form.twoFactorCode || undefined, // ✅ always send if present
        },
      },
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl space-y-4"
      >
        <h1 className="text-2xl font-semibold">Admin Login</h1>

        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        {/* 2FA always visible */}
        <div>
          <label className="block text-sm mb-1">2FA Code</label>
          <input
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            placeholder="123456"
            value={form.twoFactorCode}
            onChange={(e) =>
              setForm({ ...form, twoFactorCode: e.target.value })
            }
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
          />
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full py-2 rounded-xl font-medium shadow-md transition",
            loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
