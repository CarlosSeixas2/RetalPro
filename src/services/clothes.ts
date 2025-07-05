import api from "./api";

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
  createdAt: string;
  updatedAt: string;
}

export type CreateClothingData = Omit<
  Clothing,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateClothingData = Partial<CreateClothingData>;

export const clothesService = {
  async getAll(): Promise<Clothing[]> {
    const response = await api.get("/clothes");
    return response.data as Clothing[];
  },

  async getById(id: string): Promise<Clothing> {
    const response = await api.get(`/clothes/${id}`);
    return response.data as Clothing;
  },

  async create(data: CreateClothingData): Promise<Clothing> {
    const clothingData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = await api.post("/clothes", clothingData);
    return response.data as Clothing;
  },

  async update(id: string, data: UpdateClothingData): Promise<Clothing> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const response = await api.patch(`/clothes/${id}`, updateData);
    return response.data as Clothing;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clothes/${id}`);
  },

  async getByStatus(status: Clothing["status"]): Promise<Clothing[]> {
    const response = await api.get(`/clothes?status=${status}`);
    return response.data as Clothing[];
  },

  async search(query: string): Promise<Clothing[]> {
    const response = await api.get(`/clothes?q=${query}`);
    return response.data as Clothing[];
  },
};
