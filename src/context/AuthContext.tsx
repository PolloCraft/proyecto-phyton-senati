import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { limpiarDatosStorage } from "../utils/storage";

interface AuthContextType {
  email: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => {
    return localStorage.getItem("userEmail");
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  useEffect(() => {
    if (email && token) {
      localStorage.setItem("userEmail", email);
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("authToken");
    }
  }, [email, token]);

  const login = (newEmail: string, newToken: string) => {
    setEmail(newEmail);
    setToken(newToken);
  };

  const logout = () => {
    limpiarDatosStorage();
    setEmail(null);
    setToken(null);
  };

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ email, token, isAuthenticated: !!email && !!token, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
