import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersService,
  type CreateCustomerData,
  type UpdateCustomerData,
} from "../services/customers";
import { toast } from "sonner";

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

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast("Cliente cadastrado!", {
        description: "Novo cliente adicionado ao sistema.",
      });
    },
    onError: (error) => {
      toast("Erro ao cadastrar cliente", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao criar cliente:", error);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerData }) =>
      customersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast("Cliente atualizado!", {
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast("Erro ao atualizar cliente", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao atualizar cliente:", error);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast("Cliente removido!", {
        description: "O cliente foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast("Erro ao remover cliente", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao deletar cliente:", error);
    },
  });
}
