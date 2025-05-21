
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  created_at: string;
  // Additional properties needed by components
  category?: string;
  priceHistory: PricePoint[];
  currentPrice: number;
  updatedAt: string;
  imageUrl?: string; // alias for image_url for backward compatibility
  createdAt?: string; // alias for created_at for backward compatibility
  deleted?: boolean; // Flag for soft delete
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

export interface ProductAudit {
  id: string;
  product_id: string;
  product_name: string;
  action: 'ADDED' | 'EDITED' | 'DELETED' | 'RECOVERED';
  performed_by: string;
  timestamp: string;
}
