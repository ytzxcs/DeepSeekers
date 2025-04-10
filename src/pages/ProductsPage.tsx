
import { useState } from 'react';
import { PlusCircle, Search, Edit, Trash2, Table2, Grid3X3 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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
        {/* Header with title and breadcrumb */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <div className="text-sm text-muted-foreground mt-1">
            Manage, track and update your product inventory
          </div>
        </div>

        <Separator />
        
        {/* Action bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search and filters */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="hidden sm:flex border rounded-md">
              <Button 
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Add product button */}
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        {/* Products display */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Product Inventory</h2>
            <p className="text-sm text-muted-foreground">
              All your products and their current information
            </p>
          </div>
          
          {/* Products Table */}
          <div className="p-4">
            <ProductsTable 
              searchQuery={searchQuery} 
              refreshTrigger={refreshTrigger} 
              onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
            />
          </div>
        </div>
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
