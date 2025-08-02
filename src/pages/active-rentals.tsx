import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Eye,
  Edit,
} from "lucide-react";
import { useData } from "../contexts/data-context";
import { useToast } from "../hooks/use-toast";
import { SearchInput } from "../components/molecules/search-input";
import { Pagination } from "../components/molecules/pagination";
import { useTableFilters } from "../hooks/use-table-filters";
import Header from "../components/molecules/header";

export default function ActiveRentalsPage() {
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [actualReturnDate, setActualReturnDate] = useState("");
  const [fine, setFine] = useState("");
  const [notes, setNotes] = useState("");

  const { rentals, customers, clothes, updateRental } = useData();
  const { showSuccess, showError } = useToast();

  // Filtrar apenas aluguéis ativos
  const activeRentals = rentals.filter((rental) => rental.status === "active");

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
    data: activeRentals,
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

  const handleViewRental = (rental: any) => {
    setSelectedRental(rental);
    setIsViewDialogOpen(true);
  };

  const handleEditRental = (rental: any) => {
    setSelectedRental(rental);
    setActualReturnDate(rental.actualReturnDate || "");
    setFine(rental.fine?.toString() || "");
    setNotes(rental.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateRental = () => {
    if (!selectedRental) return;

    try {
      const updatedRental = {
        ...selectedRental,
        actualReturnDate: actualReturnDate || undefined,
        fine: fine ? parseFloat(fine) : undefined,
        notes: notes || undefined,
        status: actualReturnDate ? "returned" : "active",
      };

      updateRental(selectedRental.id, updatedRental);

      showSuccess("Aluguel atualizado!", {
        description: "As informações foram salvas com sucesso.",
      });

      setIsEditDialogOpen(false);
      setSelectedRental(null);
      setActualReturnDate("");
      setFine("");
      setNotes("");
    } catch (error) {
      showError("Erro ao atualizar aluguel", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const calculateDaysOverdue = (returnDate: string) => {
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    const diffTime = returnDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOverdueStatus = (rental: any) => {
    const daysOverdue = calculateDaysOverdue(rental.returnDate);
    if (daysOverdue < 0) {
      return {
        isOverdue: true,
        days: Math.abs(daysOverdue),
        variant: "destructive" as const,
      };
    } else if (daysOverdue <= 2) {
      return {
        isOverdue: false,
        days: daysOverdue,
        variant: "secondary" as const,
      };
    }
    return {
      isOverdue: false,
      days: daysOverdue,
      variant: "default" as const,
    };
  };

  return (
    <div className="space-y-6">
      <Header
        title="Aluguéis Ativos"
        subtitle="Gerencie aluguéis em andamento"
      />

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Aluguéis Ativos</CardTitle>
          <CardDescription>
            Digite o ID do aluguel para buscar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por ID do aluguel..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Tabela de Aluguéis Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Aluguéis Ativos ({totalItems})
          </CardTitle>
          <CardDescription>
            Lista de todos os aluguéis em andamento
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRentals.map((rental) => {
                const details = getRentalDetails(rental);
                const overdueStatus = getOverdueStatus(rental);

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
                          {new Date(rental.returnDate).toLocaleDateString("pt-BR")}
                        </p>
                        {overdueStatus.isOverdue && (
                          <p className="text-sm text-red-600 font-medium">
                            {overdueStatus.days} dias atrasado
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={overdueStatus.variant}>
                        {overdueStatus.isOverdue ? "Atrasado" : "Ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          R$ {rental.totalValue.toFixed(2)}
                        </p>
                        {rental.fine && (
                          <p className="text-sm text-red-600">
                            + R$ {rental.fine.toFixed(2)} multa
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRental(rental)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRental(rental)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {paginatedRentals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluguel ativo encontrado.
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

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluguel</DialogTitle>
            <DialogDescription>
              Informações completas do aluguel selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedRental && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID do Aluguel</Label>
                  <p className="text-sm text-muted-foreground">
                    #{selectedRental.id.slice(-6)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Cliente</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  {(() => {
                    const details = getRentalDetails(selectedRental);
                    return (
                      <div className="space-y-1">
                        <p className="font-medium">{details.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CPF: {details.customer?.cpf}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Telefone: {details.customer?.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Email: {details.customer?.email}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de Retirada</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRental.rentDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Devolução</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRental.returnDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Roupas Alugadas</Label>
                <div className="mt-2 space-y-2">
                  {(() => {
                    const details = getRentalDetails(selectedRental);
                    return details.clothes.map((clothing: any) => (
                      <div
                        key={clothing.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <div>
                          <p className="font-medium">{clothing.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {clothing.type} • {clothing.size} • {clothing.color}
                          </p>
                        </div>
                        <p className="font-medium">
                          R$ {clothing.price.toFixed(2)}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Valor Total</Label>
                  <p className="text-lg font-bold text-green-600">
                    R$ {selectedRental.totalValue.toFixed(2)}
                  </p>
                </div>
                {selectedRental.fine && (
                  <div>
                    <Label className="text-sm font-medium">Multa</Label>
                    <p className="text-lg font-bold text-red-600">
                      R$ {selectedRental.fine.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {selectedRental.notes && (
                <div>
                  <Label className="text-sm font-medium">Observações</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRental.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Aluguel</DialogTitle>
            <DialogDescription>
              Atualize as informações do aluguel
            </DialogDescription>
          </DialogHeader>
          {selectedRental && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="actualReturnDate">Data de Devolução Real</Label>
                <Input
                  id="actualReturnDate"
                  type="date"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fine">Multa (R$)</Label>
                <Input
                  id="fine"
                  type="number"
                  step="0.01"
                  value={fine}
                  onChange={(e) => setFine(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre o aluguel..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateRental}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 