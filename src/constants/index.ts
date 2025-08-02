// Constantes da aplicação
export const APP_CONFIG = {
  NAME: "ModaFlex",
  VERSION: "1.0.0",
  API_TIMEOUT: 10000,
  STORAGE_KEYS: {
    TOKEN: "rental-token",
    USER: "rental-user",
  },
} as const;

// Status das roupas
export const CLOTHING_STATUS = {
  AVAILABLE: "available",
  RENTED: "rented",
  WASHING: "washing",
  DAMAGED: "damaged",
} as const;

// Status dos alugueis
export const RENTAL_STATUS = {
  ACTIVE: "active",
  RETURNED: "returned",
  OVERDUE: "overdue",
} as const;

// Rotas da aplicação
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CLOTHES: "/clothes",
  CUSTOMERS: "/customers",
  RENTALS: "/rentals",
  ACTIVE_RENTALS: "/active-rentals",
  RETURNS: "/returns",
  REPORTS: "/reports",
  CALENDAR: "/calendar",
} as const;

// Mensagens de toast
export const TOAST_MESSAGES = {
  SUCCESS: {
    CLOTHING_CREATED: "Roupa cadastrada!",
    CLOTHING_UPDATED: "Roupa atualizada!",
    CLOTHING_DELETED: "Roupa removida!",
    CUSTOMER_CREATED: "Cliente cadastrado!",
    CUSTOMER_UPDATED: "Cliente atualizado!",
    CUSTOMER_DELETED: "Cliente removido!",
    RENTAL_CREATED: "Aluguel registrado!",
    RENTAL_UPDATED: "Aluguel atualizado!",
    RENTAL_DELETED: "Aluguel removido!",
  },
  ERROR: {
    GENERIC: "Ocorreu um erro. Tente novamente mais tarde.",
    NETWORK: "Erro de conexão. Verifique sua internet.",
    UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
  },
} as const; 