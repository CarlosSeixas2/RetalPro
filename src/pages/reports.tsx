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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import { Download, FileText, Calendar, Filter, ChevronsUpDown, Check } from "lucide-react";
import { useData } from "../contexts/data-context";
import { useToast } from "../hooks/use-toast";
import { SearchInput } from "../components/molecules/search-input";
import { Pagination } from "../components/molecules/pagination";
import { ExportManager } from "../utils/export";
import { useTableFilters } from "../hooks/use-table-filters";
import { RENTAL_STATUS } from "../constants";
import Header from "../components/molecules/header";
import { cn } from "../lib/utils";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);

  const { rentals, customers, clothes } = useData();
  const { showSuccess, showError } = useToast();

  const processedRentals = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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

  // Usar o hook de filtros para busca e paginação
  const {
    search,
    setSearch,
    paginatedData: paginatedRentals,
    page,
    setPage,
    totalItems,
    totalPages,
    itemsPerPage,
  } = useTableFilters({
    data: filteredRentals,
    searchFields: ["id"],
    defaultItemsPerPage: 10,
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
    try {
      const exportData = filteredRentals.map((rental) => {
        const details = getRentalDetails(rental);
        return {
          ID: rental.id.slice(-6),
          Cliente: details.customer?.name || "",
          CPF: details.customer?.cpf || "",
          "Data Retirada": ExportManager.formatDate(rental.rentDate),
          "Data Devolução": ExportManager.formatDate(rental.returnDate),
          "Data Devolução Real": rental.actualReturnDate 
            ? ExportManager.formatDate(rental.actualReturnDate)
            : "",
          Status: getStatusLabel(rental.status),
          Valor: ExportManager.formatCurrency(rental.totalValue),
          Multa: ExportManager.formatCurrency(rental.fine || 0),
          Total: ExportManager.formatCurrency(rental.totalValue + (rental.fine || 0)),
          Roupas: details.clothes.map((c: any) => c?.name).join("; "),
        };
      });

      ExportManager.exportToPDF({
        data: exportData,
        filename: "relatorio-alugueis",
        title: "Relatório de Aluguéis",
      });

      showSuccess("Relatório exportado!", {
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      showError("Erro ao exportar PDF", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const exportToCSV = () => {
    try {
      const exportData = filteredRentals.map((rental) => {
        const details = getRentalDetails(rental);
        return {
          ID: rental.id.slice(-6),
          Cliente: details.customer?.name || "",
          CPF: details.customer?.cpf || "",
          Telefone: details.customer?.phone || "",
          "Data Retirada": ExportManager.formatDate(rental.rentDate),
          "Data Devolução": ExportManager.formatDate(rental.returnDate),
          "Data Devolução Real": rental.actualReturnDate 
            ? ExportManager.formatDate(rental.actualReturnDate)
            : "",
          Status: getStatusLabel(rental.status),
          Valor: ExportManager.formatCurrency(rental.totalValue),
          Multa: ExportManager.formatCurrency(rental.fine || 0),
          Total: ExportManager.formatCurrency(rental.totalValue + (rental.fine || 0)),
          Roupas: details.clothes.map((c: any) => c?.name).join("; "),
        };
      });

      ExportManager.exportToCSV({
        data: exportData,
        filename: "relatorio-alugueis",
      });

      showSuccess("Relatório exportado!", {
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      showError("Erro ao exportar CSV", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      active: "Ativo",
      returned: "Devolvido",
      overdue: "Atrasado",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const statusMap = {
    active: { label: "Ativo", variant: "default" as const },
    returned: { label: "Devolvido", variant: "secondary" as const },
    overdue: { label: "Atrasado", variant: "destructive" as const },
  };

  // Obter cliente selecionado
  const selectedCustomer = customers.find((c) => c.id === customerFilter);

  return (
    <div className="space-y-6">
      <Header
        title="Relatórios"
        subtitle="Visualize e exporte relatórios de aluguéis"
      />
      

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
                  <SelectItem value={RENTAL_STATUS.ACTIVE}>Ativo</SelectItem>
                  <SelectItem value={RENTAL_STATUS.RETURNED}>Devolvido</SelectItem>
                  <SelectItem value={RENTAL_STATUS.OVERDUE}>Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Popover open={customerComboboxOpen} onOpenChange={setCustomerComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerComboboxOpen}
                    className="w-full justify-between"
                  >
                    {customerFilter !== "all"
                      ? customers.find((customer) => customer.id === customerFilter)?.name
                      : "Todos os clientes..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setCustomerFilter("all");
                            setCustomerComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerFilter === "all"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Todos os Clientes
                        </CommandItem>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.name}
                            onSelect={() => {
                              setCustomerFilter(customer.id);
                              setCustomerComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                customerFilter === customer.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {customer.cpf}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Histórico de Aluguéis ({totalItems})
              </CardTitle>
              <CardDescription>
                Lista detalhada de todos os aluguéis filtrados
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {paginatedRentals.map((rental) => {
                const details = getRentalDetails(rental);
                const total = rental.totalValue + (rental.fine || 0);

                return (
                  <TableRow key={rental.id}>
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

          {paginatedRentals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluguel encontrado com os filtros aplicados.
            </div>
          )}

          {/* Paginação */}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
