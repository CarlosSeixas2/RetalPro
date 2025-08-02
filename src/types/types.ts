import type z from "zod";
import type { clothingSchema } from "../validators/validators";

export interface Clothing {
  id: string;
  name: string;
  type: string;
  size: string;
  color: string;
  photo?: string;
  status: "available" | "rented" | "washing" | "damaged";
  price: number;
  notes?: string;
  // Gestão de Estoque Avançada
  quantity: number;
  minQuantity: number;
  category: string;
  season: string;
  occasion: string;
  brand?: string;
  material?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface StockMovement {
  id: string;
  clothingId: string;
  type: "in" | "out" | "adjustment" | "damage" | "maintenance";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  date: string;
  userId: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface Rental {
  id: string;
  customerId: string;
  clothingIds: string[];
  rentDate: string;
  returnDate: string;
  actualReturnDate?: string;
  totalValue: number;
  status: "active" | "returned" | "overdue";
  fine?: number;
  notes?: string;
}

export type ClothingForm = z.infer<typeof clothingSchema>;
