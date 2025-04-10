
import { useState } from 'react';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductsTable from '@/components/ProductsTable';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    prodcode: '',
    description: '',
    unit: ''
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleAddProduct = async () => {
    if (!newProduct.prodcode) {
      toast({
        title: "Error",
        description: "Product code is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product')
        .insert(newProduct);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully"
      });
      
      setIsAddDialogOpen(false);
      setNewProduct({ prodcode: '', description: '', unit: '' });
      setRefreshTrigger(prev => prev + 1); // Trigger refresh of product table
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-muted-foreground">Manage your product catalog and pricing</p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Products Table */}
        <ProductsTable 
          searchQuery={searchQuery} 
          refreshTrigger={refreshTrigger} 
          onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
        />
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prodcode">Product Code *</Label>
              <Input 
                id="prodcode" 
                value={newProduct.prodcode}
                onChange={(e) => setNewProduct({...newProduct, prodcode: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input 
                id="unit" 
                value={newProduct.unit}
                onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProductsPage;
