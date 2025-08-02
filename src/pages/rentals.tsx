import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  CalendarDays,
  User,
  Shirt,
  DollarSign,
  Plus,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useData } from "../contexts/data-context";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import { SearchInput } from "../components/molecules/search-input";
import { Pagination } from "../components/molecules/pagination";
import Header from "../components/molecules/header";

const rentalSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  clothingIds: z.array(z.string()).min(1, "Selecione pelo menos uma roupa"),
  rentDate: z.string().min(1, "Data de retirada é obrigatória"),
  returnDate: z.string().min(1, "Data de devolução é obrigatória"),
  notes: z.string().optional(),
});

type RentalForm = z.infer<typeof rentalSchema>;

export default function RentalsPage() {
  const [selectedClothes, setSelectedClothes] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [clothingSearch, setClothingSearch] = useState("");
  const [currentClothingPage, setCurrentClothingPage] = useState(1);
  const itemsPerClothingPage = 6;

  const { customers, clothes, addRental } = useData();
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RentalForm>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      rentDate: new Date().toISOString().split("T")[0],
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  const availableClothes = clothes.filter(
    (clothing) => clothing.status === "available"
  );

  // Filtrar roupas por busca
  const filteredClothes = availableClothes.filter(clothing =>
    clothing.name.toLowerCase().includes(clothingSearch.toLowerCase()) ||
    clothing.type.toLowerCase().includes(clothingSearch.toLowerCase()) ||
    clothing.color.toLowerCase().includes(clothingSearch.toLowerCase())
  );

  // Paginar roupas
  const startIndex = (currentClothingPage - 1) * itemsPerClothingPage;
  const endIndex = startIndex + itemsPerClothingPage;
  const paginatedClothes = filteredClothes.slice(startIndex, endIndex);
  const totalClothingPages = Math.ceil(filteredClothes.length / itemsPerClothingPage);

  const selectedCustomerId = watch("customerId");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleClothingToggle = (clothingId: string, checked: boolean) => {
    let newSelection: string[];

    if (checked) {
      newSelection = [...selectedClothes, clothingId];
    } else {
      newSelection = selectedClothes.filter((id) => id !== clothingId);
    }

    setSelectedClothes(newSelection);
    setValue("clothingIds", newSelection);

    const total = newSelection.reduce((sum, id) => {
      const clothing = clothes.find((c) => c.id === id);
      return sum + (clothing?.price || 0);
    }, 0);
    setTotalValue(total);
  };

  const onSubmit = (data: RentalForm) => {
    const rental = {
      ...data,
      clothingIds: selectedClothes,
      totalValue,
      status: "active" as const,
    };

    try {
      addRental(rental);

      showSuccess("Aluguel registrado!", {
        description: `Aluguel para ${selectedCustomer?.name} foi criado com sucesso.`,
      });

      reset({
        customerId: "",
        clothingIds: [],
        rentDate: new Date().toISOString().split("T")[0],
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "",
      });
      setSelectedClothes([]);
      setTotalValue(0);
      setClothingSearch("");
      setCurrentClothingPage(1);
    } catch (error) {
      console.error("Falha ao registrar aluguel:", error);
      showError("Erro ao registrar!", {
        description:
          "Não foi possível criar o aluguel. Por favor, tente novamente.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Novo Aluguel"
        subtitle="Registre um novo aluguel de roupas"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Selecionar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                    >
                      {selectedCustomerId
                        ? customers.find(
                            (customer) => customer.id === selectedCustomerId
                          )?.name
                        : "Selecione um cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setValue("customerId", customer.id);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === customer.id
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
                {errors.customerId && (
                  <p className="text-sm text-destructive">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              {selectedCustomer && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Informações do Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Nome:</strong> {selectedCustomer.name}
                    </p>
                    <p>
                      <strong>CPF:</strong> {selectedCustomer.cpf}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {selectedCustomer.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedCustomer.email}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Datas do Aluguel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentDate">Data de Retirada</Label>
                  <Input id="rentDate" type="date" {...register("rentDate")} />
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
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre o aluguel..."
                  {...register("notes")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Selecionar Roupas ({selectedClothes.length})
            </CardTitle>
            <CardDescription>
              Escolha as roupas que serão alugadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Busca de Roupas */}
            <div className="mb-4">
              <SearchInput
                value={clothingSearch}
                onChange={setClothingSearch}
                placeholder="Buscar roupas por nome, tipo ou cor..."
                className="max-w-md"
              />
            </div>

            {availableClothes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma roupa disponível para aluguel no momento.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedClothes.map((clothing) => (
                    <div
                      key={clothing.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedClothes.includes(clothing.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedClothes.includes(clothing.id)}
                          onCheckedChange={(checked) =>
                            handleClothingToggle(clothing.id, Boolean(checked))
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {clothing.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {clothing.type.replace("-", " ")}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {clothing.size}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {clothing.color}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-green-600 mt-2">
                            R$ {clothing.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação das Roupas */}
                {totalClothingPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentClothingPage}
                      totalPages={totalClothingPages}
                      onPageChange={setCurrentClothingPage}
                      totalItems={filteredClothes.length}
                      itemsPerPage={itemsPerClothingPage}
                    />
                  </div>
                )}
              </>
            )}
            {errors.clothingIds && (
              <p className="text-sm text-destructive mt-2">
                {errors.clothingIds.message}
              </p>
            )}
          </CardContent>
        </Card>

        {selectedClothes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo do Aluguel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Roupas Selecionadas:</h4>
                  {selectedClothes.map((clothingId) => {
                    const clothing = clothes.find((c) => c.id === clothingId);
                    if (!clothing) return null;
                    return (
                      <div
                        key={clothingId}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <span className="font-medium">{clothing.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({clothing.type} • {clothing.size} •{" "}
                            {clothing.color})
                          </span>
                        </div>
                        <span className="font-medium">
                          R$ {clothing.price.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    R$ {totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setSelectedClothes([]);
              setTotalValue(0);
              setClothingSearch("");
              setCurrentClothingPage(1);
            }}
          >
            Limpar
          </Button>
          <Button type="submit" disabled={selectedClothes.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Aluguel
          </Button>
        </div>
      </form>
    </div>
  );
}
