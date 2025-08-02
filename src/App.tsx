import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";
import Layout from "./components/organisms/layout";
import ProtectedRoute from "./components/molecules/protected-route";
import { routes } from "./config/routes";
import { ROUTES } from "./constants";
import { APP_CONFIG } from "./constants";

// Componente de loading para lazy loading
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

// Configuração do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Rota raiz - redireciona para dashboard */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Navigate to={ROUTES.DASHBOARD} replace />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Rotas públicas */}
                  {routes
                    .filter(route => !route.requiresAuth)
                    .map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<route.element />}
                      />
                    ))}

                  {/* Rotas protegidas */}
                  {routes
                    .filter(route => route.requiresAuth)
                    .map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <route.element />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                    ))}

                  {/* Rota 404 - redireciona para dashboard */}
                  <Route
                    path="*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Navigate to={ROUTES.DASHBOARD} replace />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
