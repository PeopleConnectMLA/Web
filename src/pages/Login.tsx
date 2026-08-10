import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seal from "../components/Seal";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(mobile, password);
      console.log("Logged in user role:", res?.user?.role);

      if (res?.user?.role === "MLA") {
        navigate("/dashboard");
      } else if (res?.user?.role === "OFFICER") {
        navigate("/OfficierComplaints");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid mobile number or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12 bg-grain relative overflow-hidden">
      {/* 🌟 1. Background Grid SVG Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 🌟 2. Glowing Ambient Light Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-seal/15 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 🌟 3. Floating Background Badges */}
      <div className="hidden lg:flex absolute top-12 left-12 items-center gap-2 px-4 py-2 bg-parchment/5 backdrop-blur-md border border-parchment/10 rounded-full text-parchment/70 text-xs font-medium shadow-xl pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>District Portal Active</span>
      </div>

      <div className="hidden lg:flex absolute bottom-12 right-12 items-center gap-2 px-4 py-2 bg-parchment/5 backdrop-blur-md border border-parchment/10 rounded-full text-parchment/70 text-xs font-medium shadow-xl pointer-events-none">
        <svg className="w-4 h-4 text-seal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Encrypted Official Access</span>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 bg-ink/70 rounded-2xl border border-parchment/15 shadow-2xl mb-3 backdrop-blur-md transform hover:scale-105 transition-all duration-300">
            <Seal size={56} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-parchment tracking-tight mt-2">
            People Connect <span className="text-seal">MLA</span>
          </h1>
          <p className="text-parchment/60 text-xs font-mono uppercase tracking-[0.16em] mt-1.5 bg-ink/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-parchment/10">
            District Grievance Register
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-parchment rounded-2xl shadow-card p-8 border border-parchmentDark/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="eyebrow mb-1 text-ink/60">Portal Access</p>

            {/* Mobile Number Field */}
            <label className="block">
              <span className="text-xs font-bold text-ink/80 mb-1.5 block uppercase tracking-wider">
                Mobile number
              </span>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slateink pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  className="input-field w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-ink/15 text-ink text-sm placeholder:text-slateink/50 focus:outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
            </label>

            {/* Password Field */}
            <label className="block">
              <span className="text-xs font-bold text-ink/80 mb-1.5 block uppercase tracking-wider">
                Password
              </span>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slateink pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field w-full pl-10 pr-12 py-3 bg-white rounded-xl border border-ink/15 text-ink text-sm placeholder:text-slateink/50 focus:outline-none focus:border-seal focus:ring-1 focus:ring-seal transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-xs font-bold text-seal hover:opacity-80 transition-opacity p-1.5"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-seal/10 border border-seal/20 rounded-xl text-seal text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-seal w-full mt-6 py-3.5 px-4 rounded-xl font-bold text-sm text-parchment bg-seal hover:bg-sealDark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-seal/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-parchment" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying…</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-parchment/40 mt-6">
          Authorized Personnel Access · District Network
        </p>
      </div>
    </div>
  );
}