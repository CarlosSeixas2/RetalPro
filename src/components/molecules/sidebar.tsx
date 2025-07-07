import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  LayoutDashboard,
  Shirt,
  Users,
  ShoppingCart,
  RotateCcw,
  FileText,
  LogOut,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/use-auth";
import { useState } from "react";

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Roupas", href: "/clothes", icon: Shirt },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Calendário", href: "/calendar", icon: Calendar },
  { name: "Novo Aluguel", href: "/rentals", icon: ShoppingCart },
  { name: "Devoluções", href: "/returns", icon: RotateCcw },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  // --- ADIÇÃO: Novo estado para controlar o menu ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate?.();
  };

  // --- MUDANÇA: Condição para determinar se o sidebar está expandido ---
  const isExpanded = isHovered || isMenuOpen;

  return (
    <div
      className={cn(
        "relative h-full bg-card border-r border-border",
        "transition-all duration-700 ease-in-out",
        // --- MUDANÇA: Usar a nova variável 'isExpanded' ---
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      // --- MUDANÇA: Só fechar se o menu não estiver aberto ---
      onMouseLeave={() => {
        if (!isMenuOpen) {
          setIsHovered(false);
        }
      }}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Top Section */}
        <div>
          <div className="p-4 transition-all duration-700 ease-in-out">
            <h1
              className={cn(
                "text-xl font-bold text-primary transition-opacity duration-500 ease-in-out",
                // --- MUDANÇA: Usar a nova variável 'isExpanded' ---
                isExpanded ? "opacity-100" : "opacity-0"
              )}
            >
              RentalPro
            </h1>
            {/* --- MUDANÇA: Usar a nova variável 'isExpanded' --- */}
            {isExpanded && (
              <p className="text-sm text-muted-foreground mt-1 transition-opacity duration-500 ease-in-out">
                Sistema de Aluguel
              </p>
            )}
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="px-2 py-4 h-[calc(100vh-220px)]">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span
                      className={cn(
                        "transition-all duration-500 ease-in-out",
                        // --- MUDANÇA: Usar a nova variável 'isExpanded' ---
                        isExpanded
                          ? "opacity-100 ml-1"
                          : "opacity-0 w-0 overflow-hidden"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* Bottom Section - Avatar Dropdown */}
        <div className="p-4 transition-all duration-500 ease-in-out">
          {/* --- MUDANÇA: Adicionado 'onOpenChange' --- */}
          <DropdownMenu onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-3 cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent",
                  // --- MUDANÇA: Usar a nova variável 'isExpanded' ---
                  isExpanded ? "justify-start" : "justify-center"
                )}
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt={user?.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* --- MUDANÇA: Usar a nova variável 'isExpanded' --- */}
                {isExpanded && (
                  <div className="grid text-left text-sm leading-tight transition-opacity duration-500 ease-in-out">
                    <span className="truncate font-medium text-foreground">
                      {user?.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Conta
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
