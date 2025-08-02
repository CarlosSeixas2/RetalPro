import axios from "axios";
import { APP_CONFIG } from "../constants";

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        // Limpar dados de autenticação e redirecionar
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        window.location.href = "/login";
        break;
      case 403:
        console.error("Acesso negado:", message);
        break;
      case 404:
        console.error("Recurso não encontrado:", message);
        break;
      case 500:
        console.error("Erro interno do servidor:", message);
        break;
      default:
        console.error("Erro na requisição:", message);
    }

    return Promise.reject(error);
  }
);

export default api; 