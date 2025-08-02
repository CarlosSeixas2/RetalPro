import type { ReactNode } from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { authService, type User } from "../services/auth";
import { StorageManager } from "../utils/storage";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = StorageManager.getToken();
        const storedUser = StorageManager.getUser();

        if (storedToken && storedUser) {
          const validatedUser = await authService.validateToken(storedToken);

          if (validatedUser) {
            setUser(validatedUser);
          } else {
            StorageManager.clearAuth();
          }
        }
      } catch (error) {
        console.error("Erro ao validar token:", error);
        StorageManager.clearAuth();
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

      // Salvar dados no localStorage
      StorageManager.setToken(token);
      StorageManager.setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      });

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    StorageManager.clearAuth();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

export { AuthContext };
