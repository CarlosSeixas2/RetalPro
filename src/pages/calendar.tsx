"use client";

import { DialogTrigger } from "../components/ui/dialog";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Shirt,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  useRentals,
  useCreateRental,
  useUpdateRental,
  useReturnRental,
} from "../hooks/use-rentals";
import { useCustomers } from "../hooks/use-customers";
import { useAvailableClothes } from "../hooks/use-clothes";
import type { Rental } from "../services/rentals";

const rentalSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  clothingIds: z.array(z.string()).min(1, "Selecione pelo menos uma roupa"),
  rentDate: z.string().min(1, "Data de retirada é obrigatória"),
  returnDate: z.string().min(1, "Data de devolução é obrigatória"),
  notes: z.string().optional(),
});

type RentalForm = z.infer<typeof rentalSchema>;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [viewingRental, setViewingRental] = useState<Rental | null>(null);
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);

  const { data: rentals = [] } = useRentals();
  const { data: customers = [] } = useCustomers();
  const { data: availableClothes = [] } = useAvailableClothes();
  const createRentalMutation = useCreateRental();
  const updateRentalMutation = useUpdateRental();
  const returnRentalMutation = useReturnRental();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RentalForm>({
    resolver: zodResolver(rentalSchema),
  });

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Agrupar aluguéis por data
  type RentalWithEventType = Rental & { eventType: "rent" | "return" };
  const rentalsByDate = useMemo(() => {
    const grouped: Record<string, RentalWithEventType[]> = {};

    rentals.forEach((rental) => {
      const rentDate = rental.rentDate;
      const returnDate = rental.returnDate;

      // Adicionar aluguel nas datas de retirada e devolução
      if (!grouped[rentDate]) grouped[rentDate] = [];
      if (!grouped[returnDate]) grouped[returnDate] = [];

      grouped[rentDate].push({ ...rental, eventType: "rent" });
      if (rental.status === "active") {
        grouped[returnDate].push({ ...rental, eventType: "return" });
      }
    });

    return grouped;
  }, [rentals]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayRentals = (date: Date) => {
    const dateKey = formatDateKey(date);
    return rentalsByDate[dateKey] || [];
  };

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date);
    setSelectedDate(dateKey);
    setValue("rentDate", dateKey);
    setValue(
      "returnDate",
      new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    );
  };

  const handleClothingToggle = useCallback(
    (clothingId: string, checked: boolean) => {
      let newSelection: string[];
      if (checked) {
        newSelection = [...selectedClothes, clothingId];
      } else {
        newSelection = selectedClothes.filter((id) => id !== clothingId);
      }
      setSelectedClothes(newSelection);
      setValue("clothingIds", newSelection);
    },
    [selectedClothes, setValue]
  );

  const onSubmit = (data: RentalForm) => {
    const rentalData = {
      ...data,
      clothingIds: selectedClothes,
      totalValue: selectedClothes.reduce((sum, id) => {
        const clothing = availableClothes.find((c) => c.id === id);
        return sum + (clothing?.price || 0);
      }, 0),
      status: "active" as const,
    };

    if (editingRental) {
      updateRentalMutation.mutate({ id: editingRental.id, data: rentalData });
    } else {
      createRentalMutation.mutate(rentalData);
    }

    handleCloseDialog();
  };

  const handleEdit = (rental: Rental) => {
    setEditingRental(rental);
    setValue("customerId", rental.customerId);
    setValue("clothingIds", rental.clothingIds);
    setValue("rentDate", rental.rentDate);
    setValue("returnDate", rental.returnDate);
    setValue("notes", rental.notes || "");
    setSelectedClothes(rental.clothingIds);
    setIsDialogOpen(true);
  };

  const handleReturn = (rental: Rental) => {
    returnRentalMutation.mutate({
      rentalId: rental.id,
      actualReturnDate: new Date().toISOString().split("T")[0],
      clothingIds: rental.clothingIds,
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRental(null);
    setSelectedClothes([]);
    reset();
  };

  const getCustomerName = (customerId: string) => {
    return (
      customers.find((c) => c.id === customerId)?.name ||
      "Cliente não encontrado"
    );
  };

  const getClothingNames = (clothingIds: string[]) => {
    return clothingIds
      .map((id) => {
        const clothing = availableClothes.find((c) => c.id === id);
        return clothing?.name || "Roupa não encontrada";
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendário de Aluguéis</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os aluguéis no calendário
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRental(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluguel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRental ? "Editar Aluguel" : "Novo Aluguel"}
              </DialogTitle>
              <DialogDescription>
                {editingRental
                  ? "Atualize as informações do aluguel"
                  : "Crie um novo aluguel no calendário"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    onValueChange={(value) => setValue("customerId", value)}
                    value={watch("customerId") || ""}
                    key={editingRental?.id || "new"} // Adicionar key única
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {customer.phone}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <p className="text-sm text-destructive">
                      {errors.customerId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rentDate">Data de Retirada</Label>
                      <Input
                        id="rentDate"
                        type="date"
                        {...register("rentDate")}
                      />
                      {errors.rentDate && (
                        <p className="text-sm text-destructive">
                          {errors.rentDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Data de Devolução</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        {...register("returnDate")}
                      />
                      {errors.returnDate && (
                        <p className="text-sm text-destructive">
                          {errors.returnDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seleção de Roupas */}
              <div className="space-y-4">
                <Label>
                  Roupas Disponíveis ({selectedClothes.length} selecionadas)
                </Label>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {availableClothes.map((clothing) => (
                    <div
                      key={clothing.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        selectedClothes.includes(clothing.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedClothes.includes(clothing.id)}
                          onCheckedChange={(checked) =>
                            handleClothingToggle(
                              clothing.id,
                              checked as boolean
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {clothing.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {clothing.type.replace("-", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {clothing.size}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-green-600 mt-1">
                            R$ {clothing.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.clothingIds && (
                  <p className="text-sm text-destructive">
                    {errors.clothingIds.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre o aluguel..."
                  {...register("notes")}
                />
              </div>

              {/* Resumo */}
              {selectedClothes.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Resumo do Aluguel</h4>
                  <div className="flex justify-between items-center">
                    <span>{selectedClothes.length} peça(s) selecionada(s)</span>
                    <span className="text-lg font-bold text-green-600">
                      R${" "}
                      {selectedClothes
                        .reduce((sum, id) => {
                          const clothing = availableClothes.find(
                            (c) => c.id === id
                          );
                          return sum + (clothing?.price || 0);
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={selectedClothes.length === 0}>
                  {editingRental ? "Atualizar" : "Criar"} Aluguel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayRentals = getDayRentals(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isTodayDate
                      ? "bg-primary/10 border-primary"
                      : isCurrentMonthDay
                      ? "bg-background hover:bg-accent"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isTodayDate ? "text-primary" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayRentals.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayRentals.length}
                      </Badge>
                    )}
                  </div>

                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {dayRentals.slice(0, 3).map((rental, idx) => {
                      const isRentEvent = (rental as any).eventType === "rent";
                      const isOverdue =
                        rental.status === "active" &&
                        new Date(rental.returnDate) < new Date();

                      return (
                        <div
                          key={`${rental.id}-${idx}`}
                          className={`text-xs p-1 rounded truncate ${
                            isRentEvent
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : isOverdue
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingRental(rental);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {isRentEvent ? (
                              <Shirt className="h-3 w-3" />
                            ) : isOverdue ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span className="truncate">
                              {getCustomerName(rental.customerId)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {dayRentals.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayRentals.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-sm">Retirada de Aluguel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">Devolução Prevista</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">Devolução Atrasada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Visualização de Aluguel */}
      <Dialog
        open={!!viewingRental}
        onOpenChange={() => setViewingRental(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluguel</DialogTitle>
            <DialogDescription>
              Informações completas do aluguel selecionado
            </DialogDescription>
          </DialogHeader>

          {viewingRental && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm">
                    {getCustomerName(viewingRental.customerId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      viewingRental.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {viewingRental.status === "active" ? "Ativo" : "Devolvido"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Data de Retirada
                  </Label>
                  <p className="text-sm">
                    {new Date(viewingRental.rentDate).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Data de Devolução
                  </Label>
                  <p className="text-sm">
                    {new Date(viewingRental.returnDate).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Roupas</Label>
                <p className="text-sm">
                  {getClothingNames(viewingRental.clothingIds)}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Valor Total</Label>
                <p className="text-lg font-bold text-green-600">
                  R$ {viewingRental.totalValue.toFixed(2)}
                </p>
              </div>

              {viewingRental.notes && (
                <div>
                  <Label className="text-sm font-medium">Observações</Label>
                  <p className="text-sm">{viewingRental.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewingRental(null)}
                >
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingRental(null);
                    handleEdit(viewingRental);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {viewingRental.status === "active" && (
                  <Button
                    onClick={() => {
                      setViewingRental(null);
                      handleReturn(viewingRental);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Devolvido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
