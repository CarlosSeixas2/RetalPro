// src/app/calendar/calendar.tsx

import { DialogTrigger } from "../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

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
  Edit,
  Shirt,
  CheckCircle,
} from "lucide-react";
import {
  useRentals,
  useCreateRental,
  useUpdateRental,
} from "../hooks/use-rentals";
import { useCustomers } from "../hooks/use-customers";
// CORREÇÃO: Importar ambos os hooks para roupas
import { useClothes, useAvailableClothes } from "../hooks/use-clothes";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [viewingRental, setViewingRental] = useState<Rental | null>(null);
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);

  const { data: rentals = [] } = useRentals();
  const { data: customers = [] } = useCustomers();
  // CORREÇÃO: Usar os dois hooks de roupas
  const { data: allClothes = [] } = useClothes();
  const { data: availableClothes = [] } = useAvailableClothes();
  const createRentalMutation = useCreateRental();
  const updateRentalMutation = useUpdateRental();

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
  type RentalWithEventType = Rental & {
    eventType: "rent" | "return" | "returned" | "overdue";
  };

  const rentalsByDate = useMemo(() => {
    const grouped: Record<string, RentalWithEventType[]> = {};

    rentals.forEach((rental) => {
      const rentDate = rental.rentDate;
      const returnDate = rental.returnDate;
      const isReturned = rental.status === "returned";
      const now = new Date();

      // Evento de retirada
      if (!grouped[rentDate]) grouped[rentDate] = [];
      grouped[rentDate].push({ ...rental, eventType: "rent" });

      // Evento de devolução (prevista ou realizada)
      if (!grouped[returnDate]) grouped[returnDate] = [];

      const returnDateObj = new Date(returnDate + "T23:59:59");

      if (isReturned) {
        grouped[returnDate].push({ ...rental, eventType: "returned" });
      } else if (returnDateObj < now) {
        grouped[returnDate].push({ ...rental, eventType: "overdue" });
      } else {
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

  // CORREÇÃO: Lógica de submit ajustada
  const onSubmit = (data: RentalForm) => {
    const rentalPayload = {
      ...data,
      clothingIds: selectedClothes,
      totalValue: selectedClothes.reduce((sum, id) => {
        const clothing = allClothes.find((c) => c.id === id); // Usar allClothes para cálculo
        return sum + (clothing?.price || 0);
      }, 0),
    };

    if (editingRental) {
      const updateData = {
        ...rentalPayload,
        status: editingRental.status, // Preservar status original ao editar
      };

      // A lógica para ATUALIZAR O STATUS DAS ROUPAS (disponível/alugado)
      // deve ser implementada dentro do hook `useUpdateRental`.
      updateRentalMutation.mutate({ id: editingRental.id, data: updateData });
    } else {
      const createData = {
        ...rentalPayload,
        status: "active" as const,
      };
      createRentalMutation.mutate(createData);
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

  // CORREÇÃO: Usar allClothes para encontrar nomes de roupas
  const getClothingNames = (clothingIds: string[]) => {
    return clothingIds
      .map((id) => {
        const clothing = allClothes.find((c) => c.id === id);
        return clothing?.name || "Roupa não encontrada";
      })
      .join(", ");
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(monthIndex, 10));
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year, 10));
    setCurrentDate(newDate);
  };

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

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
            {/* O botão para criar um novo aluguel pode ser adicionado aqui, se necessário */}
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
                    key={editingRental?.id || "new"}
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
                  {/* A lista para seleção continua sendo `availableClothes` */}
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
                          // CORREÇÃO: Usar allClothes para cálculo de preço no resumo
                          const clothing = allClothes.find((c) => c.id === id);
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
            <div className="flex items-center gap-2">
              <Select
                value={currentDate.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currentDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <Popover key={index}>
                  <PopoverTrigger asChild>
                    <div
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                        isTodayDate
                          ? "bg-primary/10 border-primary"
                          : isCurrentMonthDay
                          ? "bg-background hover:bg-accent"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
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

                      {/* Eventos do dia (bolinhas) */}
                      <div className="flex flex-wrap gap-1">
                        {dayRentals.slice(0, 9).map((rental, idx) => {
                          const circleColorClass = {
                            rent: "bg-blue-500",
                            return: "bg-yellow-500",
                            returned: "bg-green-500",
                            overdue: "bg-red-500",
                          }[rental.eventType];

                          return (
                            <div
                              key={`${rental.id}-${idx}`}
                              className={`w-2.5 h-2.5 rounded-full ${circleColorClass}`}
                            />
                          );
                        })}
                        {dayRentals.length > 9 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayRentals.length - 9}
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      {dayRentals.length > 0 ? (
                        dayRentals.map((rental, idx) => {
                          const isRentEvent = rental.eventType === "rent";
                          return (
                            <div
                              key={`${rental.id}-${idx}`}
                              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => setViewingRental(rental)}
                            >
                              <div className="flex items-center gap-2">
                                {isRentEvent ? (
                                  <Shirt className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">
                                    {getCustomerName(rental.customerId)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {isRentEvent ? "Retirada" : "Devolução"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum aluguel para este dia.
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda dos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Retirada de Aluguel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Devolução Prevista</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Devolução Realizada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
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
          </DialogHeader>

          {viewingRental && (
            <div className="space-y-6 pt-4 text-sm">
              {/* Cliente */}
              <div className="rounded-xl border p-4 shadow-sm">
                <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                  Cliente
                </h4>
                <p className="text-base font-medium">
                  {getCustomerName(viewingRental.customerId)}
                </p>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-4 shadow-sm">
                  <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                    Data de Retirada
                  </h4>
                  <p className="text-base">
                    {new Date(
                      viewingRental.rentDate + "T03:00:00Z"
                    ).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <div className="rounded-xl border p-4 shadow-sm">
                  <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                    Data de Devolução
                  </h4>
                  <p className="text-base">
                    {new Date(
                      viewingRental.returnDate + "T03:00:00Z"
                    ).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </div>

              {/* Roupas Alugadas */}
              <div className="rounded-xl border p-4 shadow-sm">
                <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                  Roupas Alugadas
                </h4>
                <p className="text-base">
                  {getClothingNames(viewingRental.clothingIds)}
                </p>
              </div>

              {/* Valor Total */}
              <div className="rounded-xl border p-4 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                    Valor Total
                  </h4>
                  <p className="text-lg font-bold text-green-600">
                    R$ {viewingRental.totalValue.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Observações */}
              {viewingRental.notes && (
                <div className="rounded-xl border p-4 shadow-sm">
                  <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                    Observações
                  </h4>
                  <p className="text-sm italic text-muted-foreground">
                    {viewingRental.notes}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="rounded-xl border p-4 shadow-sm flex items-center gap-2">
                <h4 className="text-muted-foreground text-xs font-semibold mb-1">
                  Status:
                </h4>
                <Badge
                  variant={
                    viewingRental.status === "active" ? "default" : "secondary"
                  }
                >
                  {viewingRental.status === "active" ? "Ativo" : "Devolvido"}
                </Badge>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => {
                    setViewingRental(null);
                    handleEdit(viewingRental);
                  }}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>

                {viewingRental.status !== "returned" && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Devolver
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
