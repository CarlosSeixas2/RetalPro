import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { useData } from "../contexts/data-context";
import { toast } from "sonner";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");

  const { rentals, customers, clothes } = useData();

  const processedRentals = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normaliza a data atual para comparação

    return rentals.map((rental) => {
      const returnDate = new Date(rental.returnDate);
      const isOverdue = rental.status === "active" && returnDate < today;

      if (isOverdue) {
        return { ...rental, status: "overdue" as const };
      }
      return rental;
    });
  }, [rentals]);

  const filteredRentals = processedRentals.filter((rental) => {
    const matchesDateFrom = !dateFrom || rental.rentDate >= dateFrom;
    const matchesDateTo = !dateTo || rental.rentDate <= dateTo;
    const matchesStatus =
      statusFilter === "all" || rental.status === statusFilter;
    const matchesCustomer =
      customerFilter === "all" || rental.customerId === customerFilter;

    return matchesDateFrom && matchesDateTo && matchesStatus && matchesCustomer;
  });

  const getRentalDetails = (rental: any) => {
    const customer = customers.find((c) => c.id === rental.customerId);
    const rentalClothes = rental.clothingIds
      .map((id: string) => clothes.find((c) => c.id === id))
      .filter(Boolean);

    return { customer, clothes: rentalClothes };
  };

  const calculateTotalRevenue = () => {
    return filteredRentals.reduce((total, rental) => {
      return total + rental.totalValue + (rental.fine || 0);
    }, 0);
  };

  const exportToPDF = () => {
    toast("Exportando relatório...", {
      description: "O relatório em PDF será baixado em breve.",
    });
    // Aqui seria implementada a lógica de exportação para PDF
  };

  const exportToCSV = () => {
    const csvData = filteredRentals.map((rental) => {
      const details = getRentalDetails(rental);
      return {
        ID: rental.id,
        Cliente: details.customer?.name || "",
        CPF: details.customer?.cpf || "",
        Telefone: details.customer?.phone || "",
        "Data Retirada": rental.rentDate,
        "Data Devolução": rental.returnDate,
        "Data Devolução Real": rental.actualReturnDate || "",
        Status: rental.status,
        Valor: rental.totalValue,
        Multa: rental.fine || 0,
        Total: rental.totalValue + (rental.fine || 0),
        Roupas: details.clothes.map((c: any) => c?.name).join("; "),
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-alugueis-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast("Relatório exportado!", {
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const statusMap = {
    active: { label: "Ativo", variant: "default" as const },
    returned: { label: "Devolvido", variant: "secondary" as const },
    overdue: { label: "Atrasado", variant: "destructive" as const },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios de aluguéis
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Configure os filtros para gerar o relatório desejado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="returned">Devolvido</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Aluguéis
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRentals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateTotalRevenue().toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aluguéis Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredRentals.filter((r) => r.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Multas Aplicadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R${" "}
              {filteredRentals
                .reduce((total, r) => total + (r.fine || 0), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatório</CardTitle>
          <CardDescription>
            Baixe o relatório nos formatos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={exportToPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Histórico de Aluguéis ({filteredRentals.length})
          </CardTitle>
          <CardDescription>
            Lista detalhada de todos os aluguéis filtrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Retirada</TableHead>
                <TableHead>Data Devolução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Multa</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.map((rental) => {
                const details = getRentalDetails(rental);
                const total = rental.totalValue + (rental.fine || 0);

                return (
                  <TableRow key={rental.id}>
                    <TableCell className="font-mono text-sm">
                      #{rental.id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{details.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {details.customer?.cpf}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(rental.rentDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>
                          {new Date(rental.returnDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                        {rental.actualReturnDate && (
                          <p className="text-sm text-muted-foreground">
                            Real:{" "}
                            {new Date(
                              rental.actualReturnDate
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusMap[rental.status as keyof typeof statusMap]
                            ?.variant || "default"
                        }
                      >
                        {statusMap[rental.status as keyof typeof statusMap]
                          ?.label || rental.status}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {rental.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      {rental.fine ? (
                        <span className="text-red-600">
                          R$ {rental.fine.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredRentals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluguel encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
