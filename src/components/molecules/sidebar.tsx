import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  LayoutDashboard,
  Shirt,
  Users,
  ShoppingCart,
  RotateCcw,
  FileText,
  LogOut,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../contexts/use-auth";

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Roupas",
    href: "/clothes",
    icon: Shirt,
  },
  {
    name: "Clientes",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Calendário",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Novo Aluguel",
    href: "/rentals",
    icon: ShoppingCart,
  },
  {
    name: "Devoluções",
    href: "/returns",
    icon: RotateCcw,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">RentalPro</h1>
        <p className="text-sm text-muted-foreground mt-1">Sistema de Aluguel</p>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Info & Logout */}
      <div className="p-4 space-y-3">
        <div className="text-sm">
          <p className="font-medium text-foreground">{user?.name}</p>
          <p className="text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
