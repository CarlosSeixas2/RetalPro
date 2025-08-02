import { lazy } from "react";
import { ROUTES } from "../constants";

// Lazy loading para melhor performance
const LoginPage = lazy(() => import("../pages/login"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const CalendarPage = lazy(() => import("../pages/calendar"));
const ClothesPage = lazy(() => import("../pages/clothes"));
const CustomersPage = lazy(() => import("../pages/customers"));
const RentalsPage = lazy(() => import("../pages/rentals"));
const ActiveRentalsPage = lazy(() => import("../pages/active-rentals"));
const ReturnsPage = lazy(() => import("../pages/returns"));
const ReportsPage = lazy(() => import("../pages/reports"));
const StockPage = lazy(() => import("../pages/stock"));

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth: boolean;
  title: string;
  description?: string;
}

export const routes: RouteConfig[] = [
  {
    path: ROUTES.LOGIN,
    element: LoginPage,
    requiresAuth: false,
    title: "Login",
    description: "Faça login para acessar o sistema",
  },
  {
    path: ROUTES.DASHBOARD,
    element: Dashboard,
    requiresAuth: true,
    title: "Dashboard",
    description: "Visão geral do sistema",
  },
  {
    path: ROUTES.CLOTHES,
    element: ClothesPage,
    requiresAuth: true,
    title: "Roupas",
    description: "Gerenciar estoque de roupas",
  },
  {
    path: ROUTES.CUSTOMERS,
    element: CustomersPage,
    requiresAuth: true,
    title: "Clientes",
    description: "Gerenciar cadastro de clientes",
  },
  {
    path: ROUTES.RENTALS,
    element: RentalsPage,
    requiresAuth: true,
    title: "Novo Aluguel",
    description: "Registrar novo aluguel",
  },
  {
    path: "/active-rentals",
    element: ActiveRentalsPage,
    requiresAuth: true,
    title: "Aluguéis Ativos",
    description: "Gerenciar aluguéis em andamento",
  },
  {
    path: ROUTES.RETURNS,
    element: ReturnsPage,
    requiresAuth: true,
    title: "Devoluções",
    description: "Gerenciar devoluções",
  },
  {
    path: ROUTES.REPORTS,
    element: ReportsPage,
    requiresAuth: true,
    title: "Relatórios",
    description: "Visualizar relatórios",
  },
  {
    path: ROUTES.CALENDAR,
    element: CalendarPage,
    requiresAuth: true,
    title: "Calendário",
    description: "Visualizar agenda",
  },
  {
    path: "/stock",
    element: StockPage,
    requiresAuth: true,
    title: "Estoque",
    description: "Gestão avançada de estoque",
  },
];

// Função para obter rota por path
export function getRouteByPath(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path);
}

// Função para obter todas as rotas que requerem autenticação
export function getProtectedRoutes(): RouteConfig[] {
  return routes.filter(route => route.requiresAuth);
}

// Função para obter rotas públicas
export function getPublicRoutes(): RouteConfig[] {
  return routes.filter(route => !route.requiresAuth);
} 