# Arquitetura do ModaFlex

## Visão Geral

O ModaFlex é um sistema SaaS para gestão de aluguel de roupas, desenvolvido com React, TypeScript e seguindo boas práticas de arquitetura.

## Estrutura de Pastas

```
src/
├── components/          # Componentes React (Atomic Design)
│   ├── atoms/          # Componentes básicos (Button, Input, etc.)
│   ├── molecules/      # Componentes compostos (Header, Sidebar, etc.)
│   ├── organisms/      # Componentes complexos (Layout, Forms, etc.)
│   └── ui/            # Componentes de UI reutilizáveis
├── config/            # Configurações da aplicação
│   ├── api.ts         # Configuração da API
│   └── routes.tsx     # Configuração de rotas
├── constants/         # Constantes da aplicação
│   └── index.ts       # Todas as constantes centralizadas
├── contexts/          # Contextos React
│   └── auth-context.tsx # Contexto de autenticação
├── hooks/             # Hooks customizados
│   ├── use-clothes.ts # Hooks para gestão de roupas
│   ├── use-customers.ts # Hooks para gestão de clientes
│   ├── use-rentals.ts # Hooks para gestão de alugueis
│   └── use-toast.ts   # Hook para notificações
├── pages/             # Páginas da aplicação
├── services/          # Serviços de API
├── types/             # Tipos TypeScript
├── utils/             # Utilitários
│   └── storage.ts     # Gerenciamento de localStorage
└── validators/        # Validações com Zod
```

## Princípios Arquiteturais

### 1. **Separação de Responsabilidades**
- **Services**: Lógica de comunicação com API
- **Hooks**: Lógica de estado e efeitos colaterais
- **Components**: Apenas apresentação e interação
- **Contexts**: Estado global compartilhado

### 2. **Atomic Design**
- **Atoms**: Componentes básicos (Button, Input)
- **Molecules**: Combinações simples (SearchBar, FormField)
- **Organisms**: Componentes complexos (Header, Sidebar, Forms)

### 3. **Gerenciamento de Estado**
- **React Query**: Cache e sincronização de dados
- **Context API**: Estado global de autenticação
- **Local State**: Estado local dos componentes

### 4. **Tratamento de Erros**
- Interceptors centralizados na API
- Hooks com tratamento de erro padronizado
- Toast notifications para feedback do usuário

## Padrões Utilizados

### 1. **Repository Pattern**
```typescript
// services/clothes.ts
export const clothesService = {
  async getAll(): Promise<Clothing[]>,
  async getById(id: string): Promise<Clothing>,
  async create(data: CreateClothingData): Promise<Clothing>,
  // ...
}
```

### 2. **Custom Hooks Pattern**
```typescript
// hooks/use-clothes.ts
export function useClothes() {
  return useQuery({
    queryKey: ["clothes"],
    queryFn: clothesService.getAll,
  });
}
```

### 3. **Constants Pattern**
```typescript
// constants/index.ts
export const APP_CONFIG = {
  NAME: "ModaFlex",
  VERSION: "1.0.0",
  // ...
} as const;
```

### 4. **Storage Manager Pattern**
```typescript
// utils/storage.ts
export class StorageManager {
  static getToken(): string | null
  static setToken(token: string): void
  static clearAuth(): void
  // ...
}
```

## Configurações

### 1. **API Configuration**
- Timeout configurável
- Interceptors para autenticação
- Tratamento centralizado de erros

### 2. **React Query Configuration**
- Cache time: 10 minutos
- Stale time: 5 minutos
- Retry: 1 tentativa
- Refetch on window focus: false

### 3. **Routing**
- Lazy loading para melhor performance
- Rotas protegidas e públicas
- Redirecionamento automático

## Boas Práticas Implementadas

### 1. **Type Safety**
- TypeScript em todo o projeto
- Interfaces bem definidas
- Tipos para respostas de API

### 2. **Performance**
- Lazy loading de componentes
- React Query para cache
- Suspense para loading states

### 3. **Manutenibilidade**
- Código modular e reutilizável
- Constantes centralizadas
- Padrões consistentes

### 4. **UX/UI**
- Feedback visual com toasts
- Loading states
- Tratamento de erros amigável

## Estrutura de Dados

### Entidades Principais
- **Clothing**: Roupas do estoque
- **Customer**: Clientes
- **Rental**: Alugueis
- **User**: Usuários do sistema

### Status das Entidades
- **Clothing**: available, rented, washing, damaged
- **Rental**: active, returned, overdue

## Fluxo de Autenticação

1. **Login**: Validação de credenciais
2. **Token Storage**: Armazenamento seguro
3. **Auto-refresh**: Validação automática
4. **Logout**: Limpeza de dados

## Considerações de Segurança

- Tokens JWT para autenticação
- Interceptors para renovação automática
- Limpeza de dados sensíveis
- Validação de permissões

## Escalabilidade

- Estrutura modular
- Componentes reutilizáveis
- Configurações centralizadas
- Padrões consistentes 