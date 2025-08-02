import { z } from "zod";

export const clothingSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  size: z.string().min(1, "Tamanho é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  price: z.number().min(0, "Preço deve ser positivo"),
  status: z.enum(["available", "rented", "washing", "damaged"]),
  notes: z.string().optional(),
  // Gestão de Estoque Avançada
  quantity: z.number().min(0, "Quantidade deve ser positiva"),
  minQuantity: z.number().min(0, "Quantidade mínima deve ser positiva"),
  category: z.string().min(1, "Categoria é obrigatória"),
  season: z.string().min(1, "Temporada é obrigatória"),
  occasion: z.string().min(1, "Ocasião é obrigatória"),
  brand: z.string().optional(),
  material: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
});

export const stockMovementSchema = z.object({
  clothingId: z.string().min(1, "Roupa é obrigatória"),
  type: z.enum(["in", "out", "adjustment", "damage", "maintenance"]),
  quantity: z.number().min(1, "Quantidade deve ser positiva"),
  reason: z.string().min(1, "Motivo é obrigatório"),
  notes: z.string().optional(),
});
