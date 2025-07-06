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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
import { Plus, Edit, Trash2, Search, History } from "lucide-react";
import { useData } from "../contexts/data-context";
import { toast } from "sonner";
import type { Customer } from "../types/models";

const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { customers, rentals, addCustomer, updateCustomer, deleteCustomer } =
    useData();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpf.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const getCustomerRentalHistory = (customerId: string) => {
    return rentals.filter((rental) => rental.customerId === customerId);
  };

  const onSubmit = (data: CustomerForm) => {
    // Formatar CPF
    const formattedData = {
      ...data,
      cpf: data.cpf
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
      phone: data.phone
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"),
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formattedData);
      toast("Cliente atualizado!", {
        description: "As informações foram salvas com sucesso.",
      });
    } else {
      addCustomer(formattedData);
      toast("Cliente cadastrado!", {
        description: "Novo cliente adicionado ao sistema.",
      });
    }

    handleCloseDialog();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setValue("name", customer.name);
    setValue("cpf", customer.cpf.replace(/\D/g, ""));
    setValue("phone", customer.phone.replace(/\D/g, ""));
    setValue("email", customer.email);
    setValue("address", customer.address);
    setValue("notes", customer.notes || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // Verificar se o cliente tem aluguéis ativos
    const activeRentals = rentals.filter(
      (rental) => rental.customerId === id && rental.status === "active"
    );

    if (activeRentals.length > 0) {
      toast("Não é possível excluir", {
        description: "Este cliente possui aluguéis ativos.",
      });
      return;
    }

    deleteCustomer(id);
    toast("Cliente removido!", {
      description: "O cliente foi removido do sistema.",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie informações dos clientes
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? "Atualize as informações do cliente"
                  : "Adicione um novo cliente ao sistema"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Maria Silva"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, bairro, cidade"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais sobre o cliente..."
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
                <Button type="submit">
                  {editingCustomer ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Clientes Cadastrados ({filteredCustomers.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os clientes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const rentalHistory = getCustomerRentalHistory(customer.id);
                const activeRentals = rentalHistory.filter(
                  (r) => r.status === "active"
                ).length;

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.cpf}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {rentalHistory.length} aluguéis
                          {activeRentals > 0 && (
                            <span className="text-blue-600 ml-1">
                              ({activeRentals} ativo
                              {activeRentals > 1 ? "s" : ""})
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(customer)}
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
                                Tem certeza que deseja excluir "{customer.name}
                                "? Esta ação não pode ser desfeita.
                                {activeRentals > 0 && (
                                  <span className="block mt-2 text-destructive font-medium">
                                    Atenção: Este cliente possui {activeRentals}{" "}
                                    aluguel(éis) ativo(s).
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(customer.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado com os termos de busca.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
