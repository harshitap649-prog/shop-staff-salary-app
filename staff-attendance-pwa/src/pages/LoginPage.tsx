import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, MobilePhone, Building, ArrowRight } from "lucide-react";
import logoSrc from "@/assets/logo.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logoSrc}
            alt="Shop Logo"
            className="mx-auto w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shadow-sm"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2310b981' rx='10'/%3E%3Ctext x='20' y='27' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E";
            }}
          />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Staff Attendance</h2>
          <p className="text-sm text-slate-600">Sign in to your shop account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="you@shop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 bg-danger-50 border border-danger-100 text-danger-700 text-sm flex items-center gap-2">
                <Building className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" /> Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            First time?{" "}
            <Link to="/setup" className="text-emerald-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Works on mobile &amp; laptop • Data syncs in real time
        </p>
      </div>
    </div>
  );
}
