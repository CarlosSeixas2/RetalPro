import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Shirt,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useData } from "../contexts/data-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { clothes, customers, rentals } = useData();

  // Calcular KPIs
  const availableClothes = clothes.filter(
    (c) => c.status === "available"
  ).length;
  const rentedClothes = clothes.filter((c) => c.status === "rented").length;
  const activeRentals = rentals.filter((r) => r.status === "active").length;

  // Calcular aluguéis atrasados
  const overdueRentals = rentals.filter((rental) => {
    if (rental.status !== "active") return false;
    const today = new Date();
    const returnDate = new Date(rental.returnDate);
    return today > returnDate;
  });

  // Dados para gráficos
  const clothingStatusData = [
    { name: "Disponível", value: availableClothes, color: "#10b981" },
    { name: "Alugada", value: rentedClothes, color: "#3b82f6" },
    {
      name: "Lavando",
      value: clothes.filter((c) => c.status === "washing").length,
      color: "#f59e0b",
    },
    {
      name: "Danificada",
      value: clothes.filter((c) => c.status === "damaged").length,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const monthlyData = [
    { month: "Jan", rentals: 12, revenue: 2400 },
    { month: "Fev", rentals: 19, revenue: 3800 },
    { month: "Mar", rentals: 15, revenue: 3000 },
    { month: "Abr", rentals: 22, revenue: 4400 },
    { month: "Mai", rentals: 18, revenue: 3600 },
    { month: "Jun", rentals: 25, revenue: 5000 },
  ];

  return (
    <div className="space-y-6">
      {overdueRentals.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aluguéis Atrasados</AlertTitle>
          <AlertDescription>
            Você tem {overdueRentals.length} aluguel(éis) em atraso que precisam
            de atenção.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roupas Disponíveis
            </CardTitle>
            <Shirt className="h-4 w-4 text-green-600 font-bold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {availableClothes}
            </div>
            <p className="text-xs text-muted-foreground">
              de {clothes.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roupas Alugadas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600 font-bold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {rentedClothes}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRentals} aluguéis ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aluguéis Atrasados
            </CardTitle>
            <AlertTriangle
              color="red"
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600 font-bold">
              {overdueRentals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 font-bold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Roupas</CardTitle>
            <CardDescription>Distribuição atual do estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clothingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clothingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aluguéis por Mês</CardTitle>
            <CardDescription>Histórico dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rentals" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Devoluções Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">2</div>
            <p className="text-sm text-muted-foreground mt-1">
              Roupas para devolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ 5.000</div>
            <p className="text-sm text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Casamento - Sábado</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Formatura - Domingo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
