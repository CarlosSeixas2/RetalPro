import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rentalsService,
  type CreateRentalData,
  type UpdateRentalData,
} from "../services/rentals";
import { clothesService } from "../services/clothes";
import { toast } from "sonner";

export function useRentals() {
  return useQuery({
    queryKey: ["rentals"],
    queryFn: rentalsService.getAll,
  });
}

export function useRental(id: string) {
  return useQuery({
    queryKey: ["rentals", id],
    queryFn: () => rentalsService.getById(id),
    enabled: !!id,
  });
}

export function useActiveRentals() {
  return useQuery({
    queryKey: ["rentals", "active"],
    queryFn: rentalsService.getActiveRentals,
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRentalData) => {
      // Criar o aluguel
      const rental = await rentalsService.create(data);

      // Atualizar status das roupas para "rented"
      await Promise.all(
        data.clothingIds.map((clothingId) =>
          clothesService.update(clothingId, { status: "rented" })
        )
      );

      return rental;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast.success("Aluguel registrado!", {
        description: "Aluguel criado com sucesso.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao registrar aluguel", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao criar aluguel:", error);
    },
  });
}

export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRentalData }) =>
      rentalsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast("Aluguel atualizado!", {
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast("Erro ao atualizar aluguel", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao atualizar aluguel:", error);
    },
  });
}

export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentalId,
      actualReturnDate,
      clothingIds,
    }: {
      rentalId: string;
      actualReturnDate: string;
      clothingIds: string[];
    }) => {
      // Calcular multa se necessário
      const rental = await rentalsService.getById(rentalId);
      const returnDate = new Date(actualReturnDate);
      const expectedDate = new Date(rental.returnDate);
      const isOverdue = returnDate > expectedDate;

      let fine = 0;
      if (isOverdue) {
        const daysLate = Math.ceil(
          (returnDate.getTime() - expectedDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        fine = daysLate * 20; // R$ 20 por dia de atraso
      }

      // Atualizar o aluguel
      const updatedRental = await rentalsService.returnRental(
        rentalId,
        actualReturnDate,
        fine
      );

      // Atualizar status das roupas para "available"
      await Promise.all(
        clothingIds.map((clothingId) =>
          clothesService.update(clothingId, { status: "available" })
        )
      );

      return updatedRental;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast("Devolução registrada!", {
        description: "Roupas devolvidas com sucesso.",
      });
    },
    onError: (error) => {
      toast("Erro ao registrar devolução", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao retornar aluguel:", error);
    },
  });
}

export function useCustomerRentals(customerId: string) {
  return useQuery({
    queryKey: ["rentals", "customer", customerId],
    queryFn: () => rentalsService.getByCustomer(customerId),
    enabled: !!customerId,
  });
}

export function useCancelRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentalId,
      clothingIds,
    }: {
      rentalId: string;
      clothingIds: string[];
    }) => {
      // Atualizar o aluguel para "cancelled"
      const updatedRental = await rentalsService.update(rentalId, {
        status: "cancelled",
      });

      // Atualizar status das roupas para "available"
      await Promise.all(
        clothingIds.map((clothingId) =>
          clothesService.update(clothingId, { status: "available" })
        )
      );

      return updatedRental;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      toast("Aluguel cancelado!", {
        description: "O aluguel foi cancelado com sucesso.",
      });
    },
    onError: (error) => {
      toast("Erro ao cancelar aluguel", {
        description: "Tente novamente mais tarde.",
      });
      console.error("Erro ao cancelar aluguel:", error);
    },
  });
}
