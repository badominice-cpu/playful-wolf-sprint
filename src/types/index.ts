export interface Supplier {
  id: string;
  name: string;
  contact_info?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  supplier_id: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  notes?: string;
  categories?: Category; // Para joins
  suppliers?: Supplier; // Para joins
}