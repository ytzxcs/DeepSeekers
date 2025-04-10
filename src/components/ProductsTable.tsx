
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
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import PriceHistoryDialog from './PriceHistoryDialog';

interface ProductWithPrice {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number | null;
  latestPriceDate: string | null;
}

export const ProductsTable = ({ searchQuery }: { searchQuery: string }) => {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPrice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // This query gets all products with their latest price
        const { data, error } = await supabase
          .from('product')
          .select(`
            prodcode,
            description,
            unit,
            pricehist!inner (
              unitprice,
              effdate
            )
          `)
          .order('prodcode');
        
        if (error) throw error;
        
        // Process the data to get the latest price for each product
        const processedProducts: ProductWithPrice[] = [];
        const productMap = new Map<string, ProductWithPrice>();
        
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
              latestPriceDate: latestPrice.effdate
            };
            
            // Store in map to ensure uniqueness by prodcode
            productMap.set(product.prodcode, productWithPrice);
          } else {
            // Product with no price history
            const productWithPrice: ProductWithPrice = {
              prodcode: product.prodcode,
              description: product.description || '',
              unit: product.unit || '',
              currentPrice: null,
              latestPriceDate: null
            };
            productMap.set(product.prodcode, productWithPrice);
          }
        });
        
        // Convert map to array
        Array.from(productMap.values()).forEach(product => {
          processedProducts.push(product);
        });
        
        setProducts(processedProducts);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
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
      
      {selectedProduct && (
        <PriceHistoryDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={selectedProduct}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};

export default ProductsTable;
