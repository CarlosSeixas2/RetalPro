import api from "../config/api";
import type { StockMovement } from "../types/types";

export const stockService = {
  // Buscar todas as movimentações
  getAll: async (): Promise<StockMovement[]> => {
    const response = await api.get("/stock-movements");
    return response.data as StockMovement[];
  },

  // Buscar movimentações por roupa
  getByClothingId: async (clothingId: string): Promise<StockMovement[]> => {
    const response = await api.get(`/stock-movements?clothingId=${clothingId}`);
    return response.data as StockMovement[];
  },

  // Criar nova movimentação
  create: async (movement: Omit<StockMovement, "id" | "date" | "userId">): Promise<StockMovement> => {
    const movementData = {
      ...movement,
      date: new Date().toISOString(),
      userId: "current-user", // Será substituído pelo contexto de auth
    };
    
    const response = await api.post("/stock-movements", movementData);
    return response.data as StockMovement;
  },

  // Registrar entrada de estoque
  registerIn: async (clothingId: string, quantity: number, reason: string, notes?: string) => {
    return stockService.create({
      clothingId,
      type: "in",
      quantity,
      previousQuantity: 0, // Será calculado
      newQuantity: 0, // Será calculado
      reason,
      notes,
    });
  },

  // Registrar saída de estoque
  registerOut: async (clothingId: string, quantity: number, reason: string, notes?: string) => {
    return stockService.create({
      clothingId,
      type: "out",
      quantity,
      previousQuantity: 0, // Será calculado
      newQuantity: 0, // Será calculado
      reason,
      notes,
    });
  },

  // Registrar ajuste de estoque
  registerAdjustment: async (clothingId: string, quantity: number, reason: string, notes?: string) => {
    return stockService.create({
      clothingId,
      type: "adjustment",
      quantity,
      previousQuantity: 0, // Será calculado
      newQuantity: 0, // Será calculado
      reason,
      notes,
    });
  },

  // Registrar dano/perda
  registerDamage: async (clothingId: string, quantity: number, reason: string, notes?: string) => {
    return stockService.create({
      clothingId,
      type: "damage",
      quantity,
      previousQuantity: 0, // Será calculado
      newQuantity: 0, // Será calculado
      reason,
      notes,
    });
  },

  // Registrar manutenção
  registerMaintenance: async (clothingId: string, quantity: number, reason: string, notes?: string) => {
    return stockService.create({
      clothingId,
      type: "maintenance",
      quantity,
      previousQuantity: 0, // Será calculado
      newQuantity: 0, // Será calculado
      reason,
      notes,
    });
  },
}; 