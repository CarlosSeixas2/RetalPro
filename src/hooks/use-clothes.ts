import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clothesService,
  type CreateClothingData,
  type UpdateClothingData,
} from "../services/clothes";
import { toast } from "sonner";

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

  return useMutation({
    mutationFn: (data: CreateClothingData) => clothesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast("Roupa cadastrada!", {
        description: "Nova roupa adicionada ao estoque.",
      });
    },
    onError: (error) => {
      toast("Erro ao cadastrar roupa", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao criar roupa:", error);
    },
  });
}

export function useUpdateClothing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClothingData }) =>
      clothesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast("Roupa atualizada!", {
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast("Erro ao atualizar roupa", {
        description: "Tente novamente mais tarde.",
      });
    },
  });
}

export function useDeleteClothing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clothesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast("Roupa removida!", {
        description: "A roupa foi removida do estoque.",
      });
    },
    onError: (error) => {
      toast("Erro ao remover roupa", {
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
