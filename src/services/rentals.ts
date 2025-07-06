import api from "./api";

export interface Rental {
  id: string;
  customerId: string;
  clothingIds: string[];
  rentDate: string;
  returnDate: string;
  actualReturnDate?: string;
  totalValue: number;
  status: "active" | "returned" | "overdue" | "cancelled";
  fine?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRentalData = Omit<Rental, "id" | "createdAt" | "updatedAt">;
export type UpdateRentalData = Partial<CreateRentalData>;

export const rentalsService = {
  async getAll(): Promise<Rental[]> {
    const response = await api.get("/rentals");
    return response.data as Rental[];
  },

  async getById(id: string): Promise<Rental> {
    const response = await api.get<Rental>(`/rentals/${id}`);
    return response.data as Rental;
  },

  async create(data: CreateRentalData): Promise<Rental> {
    const rentalData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = await api.post("/rentals", rentalData);
    return response.data as Rental;
  },

  async update(id: string, data: UpdateRentalData): Promise<Rental> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const response = await api.patch(`/rentals/${id}`, updateData);
    return response.data as Rental;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rentals/${id}`);
  },

  async getByCustomer(customerId: string): Promise<Rental[]> {
    const response = await api.get(`/rentals?customerId=${customerId}`);
    return response.data as Rental[];
  },

  async getByStatus(status: Rental["status"]): Promise<Rental[]> {
    const response = await api.get(`/rentals?status=${status}`);
    return response.data as Rental[];
  },

  async getActiveRentals(): Promise<Rental[]> {
    const response = await api.get("/rentals?status=active");
    return response.data as Rental[];
  },

  async returnRental(
    id: string,
    actualReturnDate: string,
    fine?: number
  ): Promise<Rental> {
    const updateData = {
      actualReturnDate,
      status: "returned" as const,
      fine: fine || 0,
      updatedAt: new Date().toISOString(),
    };
    const response = await api.patch(`/rentals/${id}`, updateData);
    return response.data as Rental;
  },
};
