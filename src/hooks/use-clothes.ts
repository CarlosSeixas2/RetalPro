import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clothesService,
  type CreateClothingData,
  type UpdateClothingData,
} from "../services/clothes";
import { useToast } from "./use-toast";
import { TOAST_MESSAGES } from "../constants";

export function useClothes() {
  return useQuery({
    queryKey: ["clothes"],
    queryFn: clothesService.getAll,
  });
}

export function useClothing(id: string) {
  return useQuery({
    queryKey: ["clothes", id],
    queryFn: () => clothesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateClothing() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateClothingData) => clothesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      showSuccess(TOAST_MESSAGES.SUCCESS.CLOTHING_CREATED, {
        description: "Nova roupa adicionada ao estoque.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar roupa:", error);
      showError("Erro ao cadastrar roupa", {
        description: "Tente novamente mais tarde.",
      });
    },
  });
}

export function useUpdateClothing() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClothingData }) =>
      clothesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      showSuccess(TOAST_MESSAGES.SUCCESS.CLOTHING_UPDATED, {
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar roupa:", error);
      showError("Erro ao atualizar roupa", {
        description: "Tente novamente mais tarde.",
      });
    },
  });
}

export function useDeleteClothing() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => clothesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      showSuccess(TOAST_MESSAGES.SUCCESS.CLOTHING_DELETED, {
        description: "A roupa foi removida do estoque.",
      });
    },
    onError: (error) => {
      console.error("Erro ao deletar roupa:", error);
      showError("Erro ao remover roupa", {
        description: "Tente novamente mais tarde.",
      });
    },
  });
}

export function useAvailableClothes() {
  return useQuery({
    queryKey: ["clothes", "available"],
    queryFn: () => clothesService.getByStatus("available"),
  });
}

export function useClothesByStatus(status: string) {
  return useQuery({
    queryKey: ["clothes", "status", status],
    queryFn: () => clothesService.getByStatus(status as any),
    enabled: !!status,
  });
}

export function useSearchClothes(query: string) {
  return useQuery({
    queryKey: ["clothes", "search", query],
    queryFn: () => clothesService.search(query),
    enabled: query.length > 0,
  });
}
