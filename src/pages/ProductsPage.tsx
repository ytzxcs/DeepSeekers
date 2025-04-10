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
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent } from '@/components/ui/card';

const ProductGrid = ({ 
  products, 
  searchQuery, 
  onEdit, 
  onDelete 
}: { 
  products: any[]; 
  searchQuery: string; 
  onEdit: (product: any) => void; 
  onDelete: (id: string) => void; 
}) => {
  const filteredProducts = products.filter(
    product => product.prodcode.toLowerCase().includes(searchQuery.toLowerCase()) || 
               product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return <div className="text-center py-8">No products found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <Card key={product.prodcode} className="overflow-hidden">
          <div className="aspect-square bg-gray-100 relative">
            <img 
              src={`https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500&h=500&fit=crop`} 
              alt={product.description || product.prodcode}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">{product.prodcode}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description || 'No description'}
            </p>
            <div className="text-sm text-muted-foreground">Unit: {product.unit || 'N/A'}</div>
            <div className="flex space-x-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(product.prodcode)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

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
  const { products: contextProducts } = useProducts();

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

  const handleEditProduct = (product: any) => {
    console.log("Edit product:", product);
  };

  const handleDeleteProduct = (id: string) => {
    console.log("Delete product:", id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <div className="text-sm text-muted-foreground mt-1">
            Manage, track and update your product inventory
          </div>
        </div>

        <Separator />
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
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
          
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Product Inventory</h2>
            <p className="text-sm text-muted-foreground">
              All your products and their current information
            </p>
          </div>
          
          <div className="p-4">
            {viewMode === 'list' ? (
              <ProductsTable 
                searchQuery={searchQuery} 
                refreshTrigger={refreshTrigger} 
                onRefresh={() => setRefreshTrigger(prev => prev + 1)} 
              />
            ) : (
              <ProductGrid 
                products={contextProducts} 
                searchQuery={searchQuery} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>
        </div>
      </div>

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
