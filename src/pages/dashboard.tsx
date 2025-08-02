import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../components/ui/chart";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Header from "../components/molecules/header";

export default function Dashboard() {
  const { clothes, customers, rentals } = useData();

  // Roupas Disponíveis
  const availableClothes = clothes.filter(
    (c) => c.status === "available"
  ).length;

  // Roupas Alugadas
  const rentedClothes = clothes.filter((c) => c.status === "rented").length;

  // Alugueis Ativos
  const activeRentals = rentals.filter((r) => r.status === "active").length;

  // Alugueis Atrasados
  const overdueRentals = rentals.filter((rental) => {
    if (rental.status !== "active") return false;
    const today = new Date();
    const returnDate = new Date(rental.returnDate);
    return today > returnDate;
  });

  // Dados para gráficos
  const clothingStatusData = [
    {
      name: "Disponível",
      value: availableClothes,
      fill: "var(--color-available)",
    },
    { name: "Alugada", value: rentedClothes, fill: "var(--color-rented)" },
    {
      name: "Lavando",
      value: clothes.filter((c) => c.status === "washing").length,
      fill: "var(--color-washing)",
    },
    {
      name: "Danificada",
      value: clothes.filter((c) => c.status === "damaged").length,
      fill: "var(--color-damaged)",
    },
  ].filter((item) => item.value > 0);

  // Dados mensais para aluguéis
  const monthlyData = [
    { month: "Janeiro", rentals: 12, revenue: 2400 },
    { month: "Fevereiro", rentals: 19, revenue: 3800 },
    { month: "Março", rentals: 15, revenue: 3000 },
    { month: "Abril", rentals: 22, revenue: 4400 },
    { month: "Maio", rentals: 18, revenue: 3600 },
    { month: "Junho", rentals: 25, revenue: 5000 },
  ];

  // Configuração para o ChartContainer do shadcn
  const chartConfig = {
    rentals: {
      label: "Aluguéis",
      color: "#3b82f6",
    },
    revenue: {
      label: "Receita",
      color: "#4caf50",
    },
    available: { label: "Disponível", color: "#10b981" },
    rented: { label: "Alugada", color: "#3b82f6" },
    washing: { label: "Lavando", color: "#f59e0b" },
    damaged: { label: "Danificada", color: "#ef4444" },
  };

  return (
    <div className="space-y-6">
      <Header
        title="Dashboard"
        subtitle="Visão geral do sistema de aluguel de roupas"
      />

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
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={clothingStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {clothingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={
                    <ChartLegendContent
                      nameKey="name"
                      payload={clothingStatusData}
                    />
                  }
                  className="-translate-y-[2px] "
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aluguéis por Mês</CardTitle>
            <CardDescription>Histórico dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                accessibilityLayer
                data={monthlyData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={20}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={20}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="rentals"
                  fill="var(--color-rentals)"
                  radius={8}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
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
