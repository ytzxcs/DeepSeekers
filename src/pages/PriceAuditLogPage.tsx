
import { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import PriceHistoryDialog from '@/components/PriceHistoryDialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProductWithPrice {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number | null;
  latestPriceDate: string | null;
}

const PriceAuditLogPage = () => {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPrice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchProducts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('price-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'pricehist' 
        },
        () => {
          // Refresh data when price history changes
          fetchProducts();
        }
      )
      .subscribe();
      
    // Also listen for product changes
    const productChannel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'product' 
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(productChannel);
    };
  }, []);
  
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
          pricehist (
            unitprice,
            effdate
          )
        `)
        .order('prodcode');
      
      if (error) throw error;
      
      // Process the data to get the latest price for each product
      const processedProducts: ProductWithPrice[] = data.map(product => {
        // For each product, find the pricehist with the most recent date
        const prices = product.pricehist;
        
        // If there are prices, find the latest one
        if (prices && prices.length > 0) {
          // Sort by date descending to get latest price
          const sortedPrices = [...prices].sort((a, b) => 
            new Date(b.effdate).getTime() - new Date(a.effdate).getTime()
          );
          
          const latestPrice = sortedPrices[0];
          
          return {
            prodcode: product.prodcode,
            description: product.description || '',
            unit: product.unit || '',
            currentPrice: latestPrice.unitprice,
            latestPriceDate: latestPrice.effdate
          };
        } else {
          // Product with no price history
          return {
            prodcode: product.prodcode,
            description: product.description || '',
            unit: product.unit || '',
            currentPrice: null,
            latestPriceDate: null
          };
        }
      });
      
      setProducts(processedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch products: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.prodcode.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.unit && product.unit.toLowerCase().includes(query))
    );
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
    fetchProducts(); // Refresh products data to update current prices
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Audit Log</h1>
          <div className="text-sm text-muted-foreground mt-1">
            View and manage price history for all products
          </div>
        </div>

        <Separator />
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchProducts} variant="outline" className="flex items-center gap-2">
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Product Price History</h2>
            <p className="text-sm text-muted-foreground">
              Click on a product to view and manage its price history
            </p>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                Error: {error}
              </div>
            ) : (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No products matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow 
                          key={product.prodcode} 
                          className="cursor-pointer hover:bg-muted"
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedProduct && (
        <PriceHistoryDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={selectedProduct}
          onClose={handleDialogClose}
        />
      )}
    </DashboardLayout>
  );
};

export default PriceAuditLogPage;
