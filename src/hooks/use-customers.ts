import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersService,
  type CreateCustomerData,
  type UpdateCustomerData,
} from "../services/customers";
import { useToast } from "../hooks/use-toast";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: customersService.getAll,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Cliente cadastrado!",
        description: "Novo cliente adicionado ao sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Erro ao criar cliente:", error);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      customersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Cliente atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar cliente:", error);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Cliente removido!",
        description: "O cliente foi removido do sistema.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Erro ao deletar cliente:", error);
    },
  });
}
