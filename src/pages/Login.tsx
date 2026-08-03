import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seal from "../components/Seal";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "MLA", label: "MLA Office", desc: "Constituency dashboard" },
  { id: "ADMIN", label: "Administrator", desc: "District management" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("MLA");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(mobile, password, role);
      console.log(res?.user?.role);

      if (res?.user?.role === 'MLA') {
        navigate("/dashboard");
      } else if (res?.user?.role === 'OFFICER') {
        navigate('/OfficierComplaints')
      } else {
        navigate("/admin");
      }
      // navigate(role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid mobile number or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-10 bg-grain">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Seal size={56} />
          <h1 className="font-display text-2xl font-semibold text-parchment mt-4">People Connect MLA</h1>
          <p className="text-parchment/50 text-sm font-mono uppercase tracking-[0.14em] mt-1">
            District Grievance Register
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-parchment rounded-sm shadow-card p-7">
          <p className="eyebrow mb-3">Sign in as</p>
          {/* <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`text-left px-3.5 py-3 rounded-sm border transition-colors ${role === r.id ? "border-seal bg-seal/5" : "border-ink/12 hover:border-ink/25"
                  }`}
              >
                <p className="text-sm font-semibold text-ink">{r.label}</p>
                <p className="text-xs text-slateink mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div> */}

          <label className="block mb-4">
            <span className="text-xs font-medium text-ink/70 mb-1.5 block">Mobile number</span>
            <input
              className="input-field"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </label>

          <label className="block mb-2">
            <span className="text-xs font-medium text-ink/70 mb-1.5 block">Password</span>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={"Password"}
            />
          </label>

          {error && <p className="text-seal text-xs mt-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-seal w-full mt-6">
            {loading ? "Verifying…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
