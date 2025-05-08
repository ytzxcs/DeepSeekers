
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { canEditProduct } = usePermissions();
  
  // Price trend calculation
  const priceHistory = product.priceHistory;
  let trend = 0;
  
  if (priceHistory.length >= 2) {
    const latestPrice = priceHistory[priceHistory.length - 1].price;
    const previousPrice = priceHistory[priceHistory.length - 2].price;
    trend = latestPrice - previousPrice;
  }

  // Format the current price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.currentPrice);

  // Get last updated time
  const lastUpdated = formatDistanceToNow(new Date(product.updatedAt), { 
    addSuffix: true 
  });

  return (
    <Card className="product-card overflow-hidden hover:ring-1 hover:ring-primary/20">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9';
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 truncate">{product.category}</p>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formattedPrice}</p>
            <p className="text-xs text-muted-foreground">Updated {lastUpdated}</p>
          </div>
          
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend === 0 
              ? 'bg-gray-100 text-gray-600' 
              : trend > 0 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
          }`}>
            {trend === 0 ? (
              <Minus className="mr-1 h-3 w-3" />
            ) : trend > 0 ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {trend === 0 
              ? 'No change' 
              : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  signDisplay: 'always',
                }).format(trend)
            }
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={canEditProduct ? "default" : "outline"}
          className="w-full"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {canEditProduct ? 'View & Edit' : 'View Details'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
