import type { Product } from "./product";

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}
