import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "attendant";
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Buscar usuário por email
      const response = await api.get<User[]>(
        `/users?email=${credentials.email}`
      );
      const users = response.data;

      if (users.length === 0) {
        throw new Error("Usuário não encontrado");
      }

      const user = users[0];

      // Verificar senha (em produção seria hash)
      if (user.password !== credentials.password) {
        throw new Error("Senha incorreta");
      }

      // Simular token JWT
      const token = btoa(
        JSON.stringify({
          userId: user.id,
          email: user.email,
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      throw new Error("Credenciais inválidas");
    }
  },

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(atob(token));

      if (decoded.exp < Date.now()) {
        throw new Error("Token expirado");
      }

      const response = await api.get(`/users/${decoded.userId}`);
      const user = response.data as User;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
      };
    } catch (error) {
      console.log("Erro ao validar token:", error);
      throw new Error("Token inválido ou expirado");
    }
  },
};
