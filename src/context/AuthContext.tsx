import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, Session } from "../types";
import { loginAPI } from "../services";

interface AuthContextValue {
  session: Session | null;
  login: (mobile: string, password: string, role: Role) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = sessionStorage.getItem("pcm_session");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(mobile: string, password: string, role: Role): Promise<Session> {

    const response = await loginAPI({ mobile, password, role });

    console.log("loginAPI =", response);

    const s: Session = {
      token: response.data.token,
      user: response.data.user,
    };

    sessionStorage.setItem("pcm_session", JSON.stringify(s));
    setSession(s);

    return s;
  }

  function logout() {
    sessionStorage.removeItem("pcm_session");
    sessionStorage.removeItem("pcm_token");
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
