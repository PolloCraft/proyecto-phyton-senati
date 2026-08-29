import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { limpiarDatosStorage } from "../utils/storage";

interface AuthContextType {
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => {
    return localStorage.getItem("userEmail");
  });

  useEffect(() => {
    if (email) {
      localStorage.setItem("userEmail", email);
    } else {
      localStorage.removeItem("userEmail");
    }
  }, [email]);

  const login = (newEmail: string) => setEmail(newEmail);
  const logout = () => {
    limpiarDatosStorage();
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ email, isAuthenticated: !!email, login, logout }}>
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
