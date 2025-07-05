import type React from "react";
import { createContext, useContext } from "react";
import {
  useClothes,
  useCreateClothing,
  useUpdateClothing,
  useDeleteClothing,
} from "../hooks/use-clothes";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../hooks/use-customers";
import {
  useRentals,
  useCreateRental,
  useUpdateRental,
  useReturnRental,
} from "../hooks/use-rentals";
import type { Clothing } from "../services/clothes";
import type { Customer } from "../services/customers";
import type { Rental } from "../services/rentals";

interface DataContextType {
  // Dados
  clothes: Clothing[];
  customers: Customer[];
  rentals: Rental[];

  // Estados de loading
  isLoadingClothes: boolean;
  isLoadingCustomers: boolean;
  isLoadingRentals: boolean;

  // Funções de Roupas
  addClothing: (
    clothing: Omit<Clothing, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateClothing: (id: string, clothing: Partial<Clothing>) => void;
  deleteClothing: (id: string) => void;

  // Funções de Clientes
  addCustomer: (
    customer: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Funções de Aluguéis
  addRental: (rental: Omit<Rental, "id" | "createdAt" | "updatedAt">) => void;
  updateRental: (id: string, rental: Partial<Rental>) => void;
  returnRental: (id: string, actualReturnDate: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Hooks para buscar dados
  const { data: clothes = [], isLoading: isLoadingClothes } = useClothes();
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const { data: rentals = [], isLoading: isLoadingRentals } = useRentals();

  // Hooks para mutações de roupas
  const createClothingMutation = useCreateClothing();
  const updateClothingMutation = useUpdateClothing();
  const deleteClothingMutation = useDeleteClothing();

  // Hooks para mutações de clientes
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Hooks para mutações de aluguéis
  const createRentalMutation = useCreateRental();
  const updateRentalMutation = useUpdateRental();
  const returnRentalMutation = useReturnRental();

  // Funções de Roupas
  const addClothing = (
    clothing: Omit<Clothing, "id" | "createdAt" | "updatedAt">
  ) => {
    createClothingMutation.mutate(clothing);
  };

  const updateClothing = (id: string, clothing: Partial<Clothing>) => {
    updateClothingMutation.mutate({ id, data: clothing });
  };

  const deleteClothing = (id: string) => {
    deleteClothingMutation.mutate(id);
  };

  // Funções de Clientes
  const addCustomer = (
    customer: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => {
    createCustomerMutation.mutate(customer);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    updateCustomerMutation.mutate({ id, data: customer });
  };

  const deleteCustomer = (id: string) => {
    deleteCustomerMutation.mutate(id);
  };

  // Funções de Aluguéis
  const addRental = (
    rental: Omit<Rental, "id" | "createdAt" | "updatedAt">
  ) => {
    const rentalData = {
      ...rental,
      totalValue:
        rental.clothingIds?.reduce((sum, clothingId) => {
          const clothing = clothes.find((c) => c.id === clothingId);
          return sum + (clothing?.price || 0);
        }, 0) || 0,
      status: "active" as const,
    };
    createRentalMutation.mutate(rentalData);
  };

  const updateRental = (id: string, rental: Partial<Rental>) => {
    updateRentalMutation.mutate({ id, data: rental });
  };

  const returnRental = (id: string, actualReturnDate: string) => {
    const rental = rentals.find((r) => r.id === id);
    if (!rental) return;

    returnRentalMutation.mutate({
      rentalId: id,
      actualReturnDate,
      clothingIds: rental.clothingIds,
    });
  };

  const contextValue: DataContextType = {
    // Dados
    clothes,
    customers,
    rentals,

    // Estados de loading
    isLoadingClothes,
    isLoadingCustomers,
    isLoadingRentals,

    // Funções de Roupas
    addClothing,
    updateClothing,
    deleteClothing,

    // Funções de Clientes
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // Funções de Aluguéis
    addRental,
    updateRental,
    returnRental,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
