import type React from "react";

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "../molecules/sidebar";
import Header from "../molecules/header";
import { DataProvider } from "../../contexts/data-context";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/calendar":
        return "Calendário de Aluguéis";
      case "/clothes":
        return "Gerenciar Roupas";
      case "/customers":
        return "Gerenciar Clientes";
      case "/rentals":
        return "Novo Aluguel";
      case "/returns":
        return "Devoluções";
      case "/reports":
        return "Relatórios";
      default:
        return "Sistema de Aluguel";
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Sidebar Mobile */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed top-4 left-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle()} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}
