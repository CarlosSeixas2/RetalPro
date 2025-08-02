import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockService } from "../services/stock";
import { clothesService } from "../services/clothes";
import { useToast } from "../hooks/use-toast";

export function useStockMovements(clothingId?: string) {
  return useQuery({
    queryKey: ["stock-movements", clothingId],
    queryFn: () => 
      clothingId 
        ? stockService.getByClothingId(clothingId)
        : stockService.getAll(),
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      clothingId,
      type,
      quantity,
      reason,
      notes,
    }: {
      clothingId: string;
      type: "in" | "out" | "adjustment" | "damage" | "maintenance";
      quantity: number;
      reason: string;
      notes?: string;
    }) => {
      // Buscar a roupa atual para obter a quantidade anterior
      const clothing = await clothesService.getById(clothingId);
      const previousQuantity = (clothing as any).quantity || 0;
      
      // Calcular nova quantidade baseada no tipo de movimentação
      let newQuantity = previousQuantity;
      switch (type) {
        case "in":
          newQuantity += quantity;
          break;
        case "out":
        case "damage":
        case "maintenance":
          newQuantity -= quantity;
          break;
        case "adjustment":
          newQuantity = quantity; // Ajuste define a quantidade diretamente
          break;
      }

      // Atualizar a quantidade da roupa
      await clothesService.update(clothingId, { quantity: newQuantity } as any);

      // Registrar a movimentação
      return stockService.create({
        clothingId,
        type,
        quantity,
        previousQuantity,
        newQuantity,
        reason,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      showSuccess("Movimentação registrada!", {
        description: "O estoque foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      showError("Erro ao registrar movimentação", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao registrar movimentação:", error);
    },
  });
}

export function useStockAlerts() {
  const { data: clothes = [] } = useQuery({
    queryKey: ["clothes"],
    queryFn: () => clothesService.getAll(),
  });

  const lowStockItems = clothes.filter(
    (clothing) => (clothing as any).quantity <= (clothing as any).minQuantity
  );

  const outOfStockItems = clothes.filter(
    (clothing) => (clothing as any).quantity === 0
  );

  const maintenanceDueItems = clothes.filter((clothing) => {
    if (!(clothing as any).nextMaintenance) return false;
    const maintenanceDate = new Date((clothing as any).nextMaintenance);
    const today = new Date();
    return maintenanceDate <= today;
  });

  return {
    lowStockItems,
    outOfStockItems,
    maintenanceDueItems,
    totalAlerts: lowStockItems.length + outOfStockItems.length + maintenanceDueItems.length,
  };
} 