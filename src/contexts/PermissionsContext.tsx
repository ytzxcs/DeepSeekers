
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UserPermissions {
  id: string;
  user_id: string | null;
  user_name: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_price_history: boolean;
  delete_price_history: boolean;
  add_price_history: boolean;
  is_admin: boolean;
  created_at: string;
}

interface PermissionsContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  canAddProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canAddPriceHistory: boolean;
  canEditPriceHistory: boolean;
  canDeletePriceHistory: boolean;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserPermissions = async () => {
    if (!user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      // First try to get permissions by user_id if it's set
      let { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no permissions found by user_id, try to find by email or name
      if (!userPermissions && user) {
        const userName = user.name || user.email?.split('@')[0] || '';
        
        const { data: namePermissions, error: nameError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_name', userName)
          .maybeSingle();

        if (namePermissions) {
          userPermissions = namePermissions;
          
          // Update the user_id in the permissions table for future lookups
          await supabase
            .from('user_permissions')
            .update({ user_id: user.id })
            .eq('id', namePermissions.id);
        }
      }

      // If still no permissions found, create default permissions
      if (!userPermissions && user) {
        const userName = user.name || user.email?.split('@')[0] || '';
        
        const { data: newPermissions, error: createError } = await supabase
          .from('user_permissions')
          .insert([
            {
              user_id: user.id,
              user_name: userName,
              edit_product: false,
              delete_product: false,
              add_product: false,
              edit_price_history: false,
              delete_price_history: false,
              add_price_history: false,
              is_admin: false
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating default permissions:', createError);
        } else {
          userPermissions = newPermissions;
        }
      }

      setPermissions(userPermissions as UserPermissions);
    } catch (error: any) {
      console.error('Error fetching user permissions:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch user permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = async () => {
    setLoading(true);
    await fetchUserPermissions();
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  // Computed permission properties
  const canAddProduct = permissions?.add_product || false;
  const canEditProduct = permissions?.edit_product || false;
  const canDeleteProduct = permissions?.delete_product || false;
  const canAddPriceHistory = permissions?.add_price_history || false;
  const canEditPriceHistory = permissions?.edit_price_history || false;
  const canDeletePriceHistory = permissions?.delete_price_history || false;
  const isAdmin = permissions?.is_admin || false;

  return (
    <PermissionsContext.Provider 
      value={{ 
        permissions, 
        loading, 
        refreshPermissions,
        canAddProduct,
        canEditProduct,
        canDeleteProduct,
        canAddPriceHistory,
        canEditPriceHistory,
        canDeletePriceHistory,
        isAdmin
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
