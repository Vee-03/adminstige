import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { adminLogin } from "../utils/authAPI";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      // Use centralized adminLogin helper with fallback
      const response = await adminLogin(email, password);
      const token = response?.data?.token;

      if (token) {
        localStorage.setItem("admin_token", token);
        onLogin();
      } else {
        setError(
          "Login berhasil tetapi token otentikasi tidak ditemukan pada respons."
        );
      }
    } catch (err) {
      // Fallback to mock login if API is not available
      console.log("API tidak tersedia, menggunakan mock login");
      console.error("AdminLogin error:", err);
      if (email === "admin@example.com" && password === "password") {
        // Store mock token for development
        localStorage.setItem("admin_token", "mock_token_" + Date.now());
        onLogin();
      } else {
        setError("Email atau password salah");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-orange-100 text-sm">
              Masuk ke dashboard admin Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-orange-500"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-semibold mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-xs">
              <p className="text-gray-700">
                Email:{" "}
                <span className="font-mono font-bold text-orange-600">
                  admin@example.com
                </span>
              </p>
              <p className="text-gray-700">
                Password:{" "}
                <span className="font-mono font-bold text-orange-600">
                  password
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © 2025 Admin Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
