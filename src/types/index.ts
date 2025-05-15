export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  created_at: string;
}

export interface PriceAuditLog {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  accountType?: string;
}
