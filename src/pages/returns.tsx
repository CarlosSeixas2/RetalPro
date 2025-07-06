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
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Shirt,
  Calendar,
} from "lucide-react";
import { useData } from "../contexts/data-context";
import { useToast } from "../hooks/use-toast";
import type { Clothing } from "../types/models";

export default function ReturnsPage() {
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const { rentals, customers, clothes, returnRental } = useData();
  const { toast } = useToast();

  const activeRentals = rentals.filter((rental) => rental.status === "active");

  const getRentalDetails = (rental: any) => {
    const customer = customers.find((c) => c.id === rental.customerId);
    const rentalClothes = rental.clothingIds
      .map((id: string) => clothes.find((c) => c.id === id))
      .filter(Boolean);

    const today = new Date();
    const expectedReturn = new Date(rental.returnDate);
    const isOverdue = today > expectedReturn;
    const daysLate = isOverdue
      ? Math.ceil(
          (today.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      customer,
      clothes: rentalClothes,
      isOverdue,
      daysLate,
      fine: daysLate * 20, // R$ 20 por dia de atraso
    };
  };

  const handleReturn = () => {
    if (!selectedRental) return;

    returnRental(selectedRental.id, returnDate);

    const details = getRentalDetails(selectedRental);

    toast({
      title: "Devolução registrada!",
      description: `Roupas de ${details.customer?.name} foram devolvidas.`,
    });

    setSelectedRental(null);
    setReturnDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Devoluções</h1>
          <p className="text-muted-foreground">
            Gerencie as devoluções de roupas alugadas
          </p>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aluguéis Ativos
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando devolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Devoluções Hoje
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                rentals.filter(
                  (r) =>
                    r.actualReturnDate ===
                    new Date().toISOString().split("T")[0]
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Devolvidas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aluguéis Atrasados
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                activeRentals.filter((rental) => {
                  const today = new Date();
                  const returnDate = new Date(rental.returnDate);
                  return today > returnDate;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Aluguéis Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Aluguéis Pendentes de Devolução</CardTitle>
          <CardDescription>
            Lista de todos os aluguéis que ainda não foram devolvidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">
                Todas as roupas foram devolvidas!
              </p>
              <p className="text-sm">Não há devoluções pendentes no momento.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Roupas</TableHead>
                  <TableHead>Data de Retirada</TableHead>
                  <TableHead>Data de Devolução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRentals.map((rental) => {
                  const details = getRentalDetails(rental);

                  return (
                    <TableRow key={rental.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {details.customer?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {details.customer?.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shirt className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {details.clothes.length} peça(s)
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {details.clothes
                                .map((c) => c?.name)
                                .join(", ")
                                .substring(0, 30)}
                              {details.clothes.length > 1 && "..."}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(rental.rentDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(rental.returnDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {details.isOverdue ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {details.daysLate} dia(s) atrasado
                          </Badge>
                        ) : (
                          <Badge variant="default">No prazo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            R$ {rental.totalValue.toFixed(2)}
                          </p>
                          {details.fine > 0 && (
                            <p className="text-sm text-red-600">
                              + R$ {details.fine.toFixed(2)} multa
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedRental(rental)}
                            >
                              Registrar Devolução
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Registrar Devolução</DialogTitle>
                              <DialogDescription>
                                Confirme os detalhes da devolução das roupas
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRental && (
                              <div className="space-y-6">
                                {/* Informações do Cliente */}
                                <div className="p-4 bg-muted rounded-lg">
                                  <h4 className="font-medium mb-2">Cliente</h4>
                                  <p className="text-sm">
                                    <strong>{details.customer?.name}</strong>
                                    <br />
                                    {details.customer?.phone} •{" "}
                                    {details.customer?.email}
                                  </p>
                                </div>

                                {/* Roupas */}
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Roupas a Devolver
                                  </h4>
                                  <div className="space-y-2">
                                    {details.clothes.map(
                                      (clothing: Clothing, index: any) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center p-2 border rounded"
                                        >
                                          <div>
                                            <span className="font-medium">
                                              {clothing?.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                              ({clothing?.type} •{" "}
                                              {clothing?.size})
                                            </span>
                                          </div>
                                          <span>
                                            R$ {clothing?.price.toFixed(2)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Cálculo de Multa */}
                                {details.isOverdue && (
                                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertTriangle className="h-4 w-4 text-red-600" />
                                      <h4 className="font-medium text-red-800">
                                        Aluguel em Atraso
                                      </h4>
                                    </div>
                                    <p className="text-sm text-red-700">
                                      {details.daysLate} dia(s) de atraso •
                                      Multa: R$ {details.fine.toFixed(2)} (R$
                                      20/dia)
                                    </p>
                                  </div>
                                )}

                                {/* Data de Devolução */}
                                <div className="space-y-2">
                                  <Label htmlFor="returnDate">
                                    Data da Devolução
                                  </Label>
                                  <Input
                                    id="returnDate"
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) =>
                                      setReturnDate(e.target.value)
                                    }
                                  />
                                </div>

                                {/* Observações */}
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Observações</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Observações sobre a devolução..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                  />
                                </div>

                                {/* Resumo Total */}
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      Total a Receber:
                                    </span>
                                    <span className="text-lg font-bold text-green-600">
                                      R${" "}
                                      {(
                                        rental.totalValue + (details.fine || 0)
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                  {details.fine > 0 && (
                                    <p className="text-sm text-green-700 mt-1">
                                      Valor original: R${" "}
                                      {rental.totalValue.toFixed(2)} + Multa: R${" "}
                                      {details.fine.toFixed(2)}
                                    </p>
                                  )}
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRental(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleReturn}>
                                    Confirmar Devolução
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
