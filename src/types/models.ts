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
