
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PricePoint {
  date: string; // ISO string format
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  imageUrl: string;
  category: string;
  priceHistory: PricePoint[];
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
