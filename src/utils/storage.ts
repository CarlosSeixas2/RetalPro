import { APP_CONFIG } from "../constants";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class StorageManager {
  // Gerenciamento de Token
  static getToken(): string | null {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  static setToken(token: string): void {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
  }

  static removeToken(): void {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  // Gerenciamento de Usuário
  static getUser(): StoredUser | null {
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as StoredUser;
    } catch {
      return null;
    }
  }

  static setUser(user: StoredUser): void {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
  }

  // Limpar todos os dados de autenticação
  static clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }

  // Verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
} 