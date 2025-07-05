import api from "./api";

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomerData = Omit<
  Customer,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCustomerData = Partial<CreateCustomerData>;

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get<Customer[]>("/customers");
    return response.data as Customer[];
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data as Customer;
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    const customerData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = await api.post("/customers", customerData);
    return response.data as Customer;
  },

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const response = await api.patch(`/customers/${id}`, updateData);
    return response.data as Customer;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async search(query: string): Promise<Customer[]> {
    const response = await api.get(`/customers?q=${query}`);
    return response.data as Customer[];
  },

  async getByCpf(cpf: string): Promise<Customer[]> {
    const response = await api.get(`/customers?cpf=${cpf}`);
    return response.data as Customer[];
  },
};
