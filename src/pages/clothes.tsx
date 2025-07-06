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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import {
  useClothes,
  useCreateClothing,
  useUpdateClothing,
  useDeleteClothing,
} from "../hooks/use-clothes";
import type { Clothing } from "../services/clothes";

const clothingSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  size: z.string().min(1, "Tamanho é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  price: z.number().min(0, "Preço deve ser positivo"),
  status: z.enum(["available", "rented", "washing", "damaged"]),
  notes: z.string().optional(),
});

type ClothingForm = z.infer<typeof clothingSchema>;

const clothingTypes = [
  "vestido",
  "terno",
  "fantasia",
  "smoking",
  "vestido-noiva",
  "terno-noivo",
  "acessorio",
  "sapato",
];
const sizes = ["PP", "P", "M", "G", "GG", "XG"];

const statusMap = {
  available: { label: "Disponível", variant: "default" as const },
  rented: { label: "Alugada", variant: "secondary" as const },
  washing: { label: "Lavando", variant: "outline" as const },
  damaged: { label: "Danificada", variant: "destructive" as const },
};

export default function ClothesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClothing, setEditingClothing] = useState<Clothing | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const {
    data: clothes = [],
    isLoading,
    error,
  } = useClothes() as {
    data: Clothing[] | undefined;
    isLoading: boolean;
    error: unknown;
  };
  const createClothingMutation = useCreateClothing();
  const updateClothingMutation = useUpdateClothing();
  const deleteClothingMutation = useDeleteClothing();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClothingForm>({
    resolver: zodResolver(clothingSchema),
    defaultValues: {
      status: "available",
    },
  });

  const filteredClothes: Clothing[] = clothes.filter(
    (clothing: Clothing): boolean => {
      const matchesSearch: boolean =
        clothing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clothing.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clothing.color.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus: boolean =
        statusFilter === "all" || clothing.status === statusFilter;
      const matchesType: boolean =
        typeFilter === "all" || clothing.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }
  );

  const onSubmit = (data: ClothingForm) => {
    if (editingClothing) {
      updateClothingMutation.mutate({ id: editingClothing.id, data });
    } else {
      createClothingMutation.mutate(data);
    }
    handleCloseDialog();
  };

  const handleEdit = (clothing: Clothing) => {
    setEditingClothing(clothing);
    setValue("name", clothing.name);
    setValue("type", clothing.type);
    setValue("size", clothing.size);
    setValue("color", clothing.color);
    setValue("price", clothing.price);
    setValue("status", clothing.status);
    setValue("notes", clothing.notes || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteClothingMutation.mutate(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClothing(null);
    reset({
      name: "",
      type: "",
      size: "",
      color: "",
      price: 0,
      status: "available",
      notes: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando roupas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          Erro ao carregar roupas. Tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Roupas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie o estoque de roupas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClothing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Roupa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingClothing ? "Editar Roupa" : "Nova Roupa"}
              </DialogTitle>
              <DialogDescription>
                {editingClothing
                  ? "Atualize as informações da roupa"
                  : "Adicione uma nova roupa ao estoque"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Vestido de Festa Azul"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    onValueChange={(value) => setValue("type", value)}
                    value={watch("type")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {clothingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() +
                            type.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Tamanho</Label>
                  <Select
                    onValueChange={(value) => setValue("size", value)}
                    value={watch("size")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.size && (
                    <p className="text-sm text-destructive">
                      {errors.size.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    placeholder="Ex: Azul"
                    {...register("color")}
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive">
                      {errors.color.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value: any) => setValue("status", value)}
                  value={watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status da roupa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="rented">Alugada</SelectItem>
                    <SelectItem value="washing">Lavando</SelectItem>
                    <SelectItem value="damaged">Danificada</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
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
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createClothingMutation.isPending ||
                    updateClothingMutation.isPending
                  }
                >
                  {(createClothingMutation.isPending ||
                    updateClothingMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingClothing ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar roupas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="rented">Alugada</SelectItem>
                <SelectItem value="washing">Lavando</SelectItem>
                <SelectItem value="damaged">Danificada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                {clothingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() +
                      type.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Roupas ({filteredClothes.length})</CardTitle>
          <CardDescription>
            Lista de todas as roupas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClothes.map((clothing) => (
                <TableRow key={clothing.id}>
                  <TableCell className="font-medium">{clothing.name}</TableCell>
                  <TableCell className="capitalize">
                    {clothing.type.replace("-", " ")}
                  </TableCell>
                  <TableCell>{clothing.size}</TableCell>
                  <TableCell>{clothing.color}</TableCell>
                  <TableCell>R$ {clothing.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[clothing.status].variant}>
                      {statusMap[clothing.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(clothing)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{clothing.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(clothing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deleteClothingMutation.isPending}
                            >
                              {deleteClothingMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClothes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma roupa encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
