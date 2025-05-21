
import { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Edit, Trash2, RefreshCw } from 'lucide-react';
import PriceHistoryDialog from './PriceHistoryDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface ProductWithPrice {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number | null;
  latestPriceDate: string | null;
  deleted?: boolean;
}

interface ProductsTableProps {
  searchQuery: string;
  refreshTrigger?: number;
  onRefresh?: () => void;
  showDeleted?: boolean;
}

export const ProductsTable = ({ searchQuery, refreshTrigger = 0, onRefresh, showDeleted = false }: ProductsTableProps) => {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPrice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithPrice | null>(null);
  const { toast } = useToast();
  const { canEditProduct, canDeleteProduct, isAdmin } = usePermissions();
  const { user } = useAuth();
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // This query gets all products with their latest price
      const { data, error } = await supabase
        .from('product')
        .select(`
          prodcode,
          description,
          unit,
          deleted,
          pricehist (
            unitprice,
            effdate
          )
        `)
        .order('prodcode');
      
      if (error) throw error;
      
      // Process the data to get the latest price for each product
      const processedProducts: ProductWithPrice[] = [];
      
      data.forEach(product => {
        // For each product, find the pricehist with the most recent date
        const prices = product.pricehist;
        
        // If there are prices, find the latest one
        if (prices && prices.length > 0) {
          // Sort by date descending to get latest price
          const sortedPrices = [...prices].sort((a, b) => 
            new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
          );
          
          const latestPrice = sortedPrices[0];
          
          const productWithPrice: ProductWithPrice = {
            prodcode: product.prodcode,
            description: product.description || '',
            unit: product.unit || '',
            currentPrice: latestPrice.unitprice,
            latestPriceDate: latestPrice.effdate,
            deleted: product.deleted || false,
          };
          
          processedProducts.push(productWithPrice);
        } else {
          // Product with no price history
          const productWithPrice: ProductWithPrice = {
            prodcode: product.prodcode,
            description: product.description || '',
            unit: product.unit || '',
            currentPrice: null,
            latestPriceDate: null,
            deleted: product.deleted || false,
          };
          processedProducts.push(productWithPrice);
        }
      });
      
      setProducts(processedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);
  
  // Filter products based on search query and deleted status
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    const textMatch = (
      product.prodcode.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.unit && product.unit.toLowerCase().includes(query))
    );
    return textMatch && (showDeleted || !product.deleted);
  });
  
  // Format price for display
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const handleProductClick = (product: ProductWithPrice) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Refresh products data to update current prices
    fetchProducts();
    if (onRefresh) onRefresh();
  };

  const handleEditClick = (e: React.MouseEvent, product: ProductWithPrice) => {
    if (!canEditProduct) {
      e.stopPropagation();
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit products",
        variant: "destructive"
      });
      return;
    }
    
    e.stopPropagation(); // Prevent row click handler
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, product: ProductWithPrice) => {
    if (!canDeleteProduct) {
      e.stopPropagation();
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete products",
        variant: "destructive"
      });
      return;
    }

    e.stopPropagation(); // Prevent row click handler
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleRecoverClick = (e: React.MouseEvent, product: ProductWithPrice) => {
    if (!isAdmin) {
      e.stopPropagation();
      toast({
        title: "Permission Denied",
        description: "You don't have permission to recover products",
        variant: "destructive"
      });
      return;
    }

    e.stopPropagation(); // Prevent row click handler
    setSelectedProduct(product);
    setIsRecoverDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !canEditProduct) return;

    try {
      const { error } = await supabase
        .from('product')
        .update({
          description: editingProduct.description,
          unit: editingProduct.unit
        })
        .eq('prodcode', editingProduct.prodcode);

      if (error) throw error;
      
      // Log audit event
      if (user) {
        await supabase
          .from('product_audit')
          .insert({
            product_id: editingProduct.prodcode,
            product_name: editingProduct.description || editingProduct.prodcode,
            action: 'EDITED',
            performed_by: user.name || user.email
          });
      }

      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      
      setIsEditDialogOpen(false);
      fetchProducts();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct || !canDeleteProduct) return;

    try {
      // Soft delete - update the deleted flag
      const { error } = await supabase
        .from('product')
        .update({ deleted: true })
        .eq('prodcode', selectedProduct.prodcode);

      if (error) throw error;
      
      // Log audit event
      if (user) {
        await supabase
          .from('product_audit')
          .insert({
            product_id: selectedProduct.prodcode,
            product_name: selectedProduct.description || selectedProduct.prodcode,
            action: 'DELETED',
            performed_by: user.name || user.email
          });
      }

      toast({
        title: "Success",
        description: "Product marked as deleted"
      });
      
      setIsDeleteDialogOpen(false);
      fetchProducts();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  };
  
  const handleRecoverProduct = async () => {
    if (!selectedProduct || !isAdmin) return;

    try {
      // Recover the product - set deleted flag to false
      const { error } = await supabase
        .from('product')
        .update({ deleted: false })
        .eq('prodcode', selectedProduct.prodcode);

      if (error) throw error;
      
      // Log audit event
      if (user) {
        await supabase
          .from('product_audit')
          .insert({
            product_id: selectedProduct.prodcode,
            product_name: selectedProduct.description || selectedProduct.prodcode,
            action: 'RECOVERED',
            performed_by: user.name || user.email
          });
      }

      toast({
        title: "Success",
        description: "Product recovered successfully"
      });
      
      setIsRecoverDialogOpen(false);
      fetchProducts();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to recover product",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error: {error}
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {filteredProducts.length === 0 
              ? 'No products found' 
              : `Showing ${filteredProducts.length} of ${products.length} products`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Product Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  No products matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow 
                  key={product.prodcode} 
                  className={`cursor-pointer hover:bg-muted ${product.deleted ? 'opacity-60' : ''}`}
                  onClick={() => handleProductClick(product)}
                >
                  <TableCell className="font-medium">{product.prodcode}</TableCell>
                  <TableCell>{product.description || 'N/A'}</TableCell>
                  <TableCell>{product.unit || 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.currentPrice)}</TableCell>
                  <TableCell className="text-right">
                    {product.latestPriceDate 
                      ? new Date(product.latestPriceDate).toLocaleDateString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.deleted ? (
                      <Badge variant="destructive">Deleted</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {canEditProduct && !product.deleted && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={(e) => handleEditClick(e, product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteProduct && !product.deleted && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteClick(e, product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && product.deleted && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-green-600 hover:bg-green-600 hover:text-white"
                          onClick={(e) => handleRecoverClick(e, product)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedProduct && (
        <PriceHistoryDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={selectedProduct}
          onClose={handleDialogClose}
        />
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-prodcode">Product Code</Label>
              <Input 
                id="edit-prodcode" 
                value={editingProduct?.prodcode || ''}
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                value={editingProduct?.description || ''}
                onChange={(e) => setEditingProduct(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input 
                id="edit-unit" 
                value={editingProduct?.unit || ''}
                onChange={(e) => setEditingProduct(prev => 
                  prev ? { ...prev, unit: e.target.value } : null
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the product "{selectedProduct?.description || selectedProduct?.prodcode}" as deleted.
              It can be recovered by an admin later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Recover Confirmation Dialog */}
      <AlertDialog open={isRecoverDialogOpen} onOpenChange={setIsRecoverDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recover Product</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to recover the product "{selectedProduct?.description || selectedProduct?.prodcode}"?
              This will make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRecoverProduct}
              className="bg-green-600 hover:bg-green-700"
            >
              Recover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductsTable;
