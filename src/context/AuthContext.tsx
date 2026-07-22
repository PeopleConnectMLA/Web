import { createContext, useContext, useState, type ReactNode } from "react";
import { login as apiLogin } from "../api/client";
import type { Role, Session } from "../types";

interface AuthContextValue {
  session: Session | null;
  login: (mobile: string, password: string, role: Role) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem("pcm_session");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(mobile: string, password: string, role: Role): Promise<Session> {
    const data = await apiLogin({ mobile, password, role });
    const s: Session = { name: data.name, role: data.role, userId: data.userId };
    localStorage.setItem("pcm_session", JSON.stringify(s));
    setSession(s);
    return s;
  }

  function logout() {
    localStorage.removeItem("pcm_session");
    localStorage.removeItem("pcm_token");
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
