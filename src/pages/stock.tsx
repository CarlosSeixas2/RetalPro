import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
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
import { Textarea } from "../components/ui/textarea";
import { AlertTriangle, Package, TrendingDown, Wrench, Plus } from "lucide-react";
import { useStockAlerts, useStockMovements, useCreateStockMovement } from "../hooks/use-stock";
import { useClothes } from "../hooks/use-clothes";
import { stockMovementSchema } from "../validators/validators";
import { useTableFilters } from "../hooks/use-table-filters";
import { SearchInput } from "../components/molecules/search-input";
import { Pagination } from "../components/molecules/pagination";
import Header from "../components/molecules/header";
import { Loader2 } from "lucide-react";

const categories = [
  "Vestidos",
  "Ternos",
  "Fantasias",
  "Smoking",
  "Vestidos de Noiva",
  "Ternos de Noivo",
  "Acessórios",
  "Sapatos",
];

const seasons = [
  "Verão",
  "Outono",
  "Inverno",
  "Primavera",
  "Ano Todo",
];

const occasions = [
  "Casamento",
  "Festa",
  "Formal",
  "Informal",
  "Fantasias",
  "Especial",
];

const movementTypes = [
  { value: "in", label: "Entrada", icon: Package },
  { value: "out", label: "Saída", icon: TrendingDown },
  { value: "adjustment", label: "Ajuste", icon: AlertTriangle },
  { value: "damage", label: "Dano", icon: AlertTriangle },
  { value: "maintenance", label: "Manutenção", icon: Wrench },
];

export default function StockPage() {
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState("all");

  const { data: clothes = [] } = useClothes();
  const { lowStockItems, outOfStockItems, maintenanceDueItems, totalAlerts } = useStockAlerts();
  const { data: movements = [] } = useStockMovements();
  const createMovementMutation = useCreateStockMovement();

  const {
    search,
    setSearch,
    paginatedData: paginatedClothes,
    page,
    setPage,
    totalItems,
    totalPages,
    itemsPerPage,
  } = useTableFilters({
    data: clothes,
    searchFields: ["name", "type", "color"],
    defaultItemsPerPage: 10,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockMovementSchema),
  });

  const handleMovementSubmit = (data: any) => {
    if (!selectedClothing) return;

    createMovementMutation.mutate({
      clothingId: selectedClothing.id,
      type: data.type,
      quantity: parseInt(data.quantity),
      reason: data.reason,
      notes: data.notes,
    });

    setIsMovementDialogOpen(false);
    reset();
  };

  const handleMovement = (clothing: any) => {
    setSelectedClothing(clothing);
    setIsMovementDialogOpen(true);
  };

  const getStockStatus = (clothing: any) => {
    if (clothing.quantity === 0) return { label: "Sem Estoque", variant: "destructive" as const };
    if (clothing.quantity <= clothing.minQuantity) return { label: "Estoque Baixo", variant: "secondary" as const };
    return { label: "Estoque OK", variant: "default" as const };
  };

  const filteredClothes = clothes.filter((clothing: any) => {
    const matchesSearch = clothing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clothing.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clothing.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || clothing.category === categoryFilter;
    
    let matchesAlert = true;
    if (alertFilter === "low") {
      matchesAlert = clothing.quantity <= clothing.minQuantity;
    } else if (alertFilter === "out") {
      matchesAlert = clothing.quantity === 0;
    } else if (alertFilter === "maintenance") {
      matchesAlert = clothing.nextMaintenance && new Date(clothing.nextMaintenance) <= new Date();
    }

    return matchesSearch && matchesCategory && matchesAlert;
  });

  return (
    <div className="space-y-6">
      <Header
        title="Gestão de Estoque"
        subtitle="Controle de quantidade, alertas e movimentações"
      />

      {/* Alertas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clothes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção Devida</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{maintenanceDueItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nome, tipo ou cor..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alertas</Label>
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os itens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Itens</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="out">Sem Estoque</SelectItem>
                  <SelectItem value="maintenance">Manutenção Devida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
          <CardDescription>
            Gerencie quantidades e movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Manutenção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClothes.map((clothing: any) => {
                const stockStatus = getStockStatus(clothing);
                return (
                  <TableRow key={clothing.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{clothing.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {clothing.type} • {clothing.size} • {clothing.color}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{clothing.category || "-"}</TableCell>
                    <TableCell>
                      <span className="font-medium">{clothing.quantity || 0}</span>
                    </TableCell>
                    <TableCell>{clothing.minQuantity || 0}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {clothing.nextMaintenance ? (
                        new Date(clothing.nextMaintenance).toLocaleDateString("pt-BR")
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleMovement(clothing)}
                        className="mr-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Movimentar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredClothes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item encontrado com os filtros aplicados.
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

      {/* Dialog de Movimentação */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma movimentação de estoque para {selectedClothing?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleMovementSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select {...register("type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                placeholder="Motivo da movimentação..."
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais..."
                {...register("notes")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMovementDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMovementMutation.isPending}>
                {createMovementMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 