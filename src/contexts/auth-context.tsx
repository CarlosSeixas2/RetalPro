import type { ReactNode } from "react";
import { createContext, useState, useEffect } from "react";
import { authService, type User } from "../services/auth";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("rental-token");
        if (storedToken) {
          const validatedUser = await authService.validateToken(storedToken);
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            localStorage.removeItem("rental-token");
            localStorage.removeItem("rental-user");
          }
        }
      } catch (error) {
        console.error("Erro ao validar token:", error);
        localStorage.removeItem("rental-token");
        localStorage.removeItem("rental-user");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: userData, token } = await authService.login({
        email,
        password,
      });
      setUser(userData);
      localStorage.setItem("rental-user", JSON.stringify(userData));
      localStorage.setItem("rental-token", token);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rental-user");
    localStorage.removeItem("rental-token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
