
import React, { createContext, useContext, useState } from 'react';
import { Product, PricePoint } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>, newPrice?: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recoverProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getAllProducts: (includeDeleted?: boolean) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Mock initial data
const generateMockProduct = (id: string, name: string, category: string, basePrice: number): Product => {
  const now = new Date();
  const createdAt = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
  
  // Generate price history for the last 3 months
  const priceHistory: PricePoint[] = [];
  for (let i = 90; i >= 0; i -= 10) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    // Add some random price fluctuation
    const adjustment = Math.random() * 0.2 - 0.1; // -10% to +10%
    const price = basePrice * (1 + adjustment);
    priceHistory.push({
      date: date.toISOString(),
      price: Math.round(price * 100) / 100,
    });
  }

  return {
    id,
    name,
    description: `This is a ${name.toLowerCase()} in the ${category.toLowerCase()} category.`,
    image_url: `https://source.unsplash.com/random/300x300/?${name.toLowerCase()}`,
    price: basePrice,
    currentPrice: priceHistory[priceHistory.length - 1].price,
    category,
    priceHistory,
    created_at: createdAt,
    updatedAt: new Date().toISOString(),
    deleted: false,
  };
};

const INITIAL_PRODUCTS: Product[] = [
  generateMockProduct('1', 'Laptop', 'Electronics', 999.99),
  generateMockProduct('2', 'Smartphone', 'Electronics', 699.99),
  generateMockProduct('3', 'Desk Chair', 'Furniture', 249.99),
  generateMockProduct('4', 'Coffee Maker', 'Appliances', 89.99),
  generateMockProduct('5', 'Headphones', 'Electronics', 149.99),
  generateMockProduct('6', 'Bookshelf', 'Furniture', 179.99),
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        created_at: now,
        updatedAt: now,
        deleted: false,
      };
      
      setProducts(prev => [...prev, newProduct]);
      
      // Log audit trail
      if (user) {
        await logProductAudit(newProduct.id, newProduct.name, 'ADDED', user.name || user.email);
      }
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>, newPrice?: number) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          const updatedProduct = { 
            ...product, 
            ...productData, 
            updatedAt: new Date().toISOString() 
          };
          
          // If a new price is provided, update price history
          if (newPrice !== undefined && newPrice !== product.currentPrice) {
            updatedProduct.currentPrice = newPrice;
            updatedProduct.price = newPrice;
            updatedProduct.priceHistory = [
              ...product.priceHistory,
              { date: new Date().toISOString(), price: newPrice }
            ];
          }
          
          return updatedProduct;
        }
        return product;
      }));
      
      // Log audit trail
      if (user) {
        const product = products.find(p => p.id === id);
        if (product) {
          await logProductAudit(product.id, product.name, 'EDITED', user.name || user.email);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Soft delete - just mark as deleted
      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          return { ...product, deleted: true, updatedAt: new Date().toISOString() };
        }
        return product;
      }));
      
      // Log audit trail
      if (user) {
        const product = products.find(p => p.id === id);
        if (product) {
          await logProductAudit(product.id, product.name, 'DELETED', user.name || user.email);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Product marked as deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const recoverProduct = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recover the deleted product
      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          return { ...product, deleted: false, updatedAt: new Date().toISOString() };
        }
        return product;
      }));
      
      // Log audit trail
      if (user) {
        const product = products.find(p => p.id === id);
        if (product) {
          await logProductAudit(product.id, product.name, 'RECOVERED', user.name || user.email);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Product recovered successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to recover product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logProductAudit = async (productId: string, productName: string, action: 'ADDED' | 'EDITED' | 'DELETED' | 'RECOVERED', performedBy: string) => {
    try {
      await supabase
        .from('product_audit')
        .insert({
          product_id: productId,
          product_name: productName,
          action,
          performed_by: performedBy
        });
    } catch (error) {
      console.error('Failed to log product audit:', error);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };
  
  const getAllProducts = (includeDeleted: boolean = false) => {
    if (includeDeleted) {
      return products;
    }
    return products.filter(product => !product.deleted);
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products: products.filter(p => !p.deleted), // By default, only return non-deleted products 
        loading, 
        addProduct, 
        updateProduct, 
        deleteProduct,
        recoverProduct,
        getProduct,
        getAllProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
