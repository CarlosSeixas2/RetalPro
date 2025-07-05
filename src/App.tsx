import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";
import Layout from "./components/organisms/layout";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import CalendarPage from "./pages/calendar";
import ClothesPage from "./pages/clothes";
import CustomersPage from "./pages/customers";
import RentalsPage from "./pages/rentals";
import ReturnsPage from "./pages/returns";
import ReportsPage from "./pages/reports";
import ProtectedRoute from "./components/molecules/protected-route";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Navigate to="/dashboard" replace />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CalendarPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clothes"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ClothesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CustomersPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rentals"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RentalsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/returns"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ReturnsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
