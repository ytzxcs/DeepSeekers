
import DashboardLayout from '@/components/DashboardLayout';
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Package, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';

const DashboardPage = () => {
  const { products } = useProducts();
  const navigate = useNavigate();

  // Calculate some quick stats
  const totalProducts = products.length;
  const averagePrice = products.reduce((sum, product) => sum + product.currentPrice, 0) / totalProducts;
  
  // Get recent price changes
  const recentPriceChanges = products
    .filter(product => product.priceHistory.length >= 2)
    .map(product => {
      const latestPrice = product.priceHistory[product.priceHistory.length - 1].price;
      const previousPrice = product.priceHistory[product.priceHistory.length - 2].price;
      const change = latestPrice - previousPrice;
      const percentChange = (change / previousPrice) * 100;
      
      return {
        ...product,
        change,
        percentChange,
      };
    })
    .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
    .slice(0, 5);

  // Get recent products
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Welcome to Your Dashboard</h2>
        
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">items in your catalog</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(averagePrice)}
              </div>
              <p className="text-xs text-muted-foreground">across all products</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentPriceChanges.length}</div>
              <p className="text-xs text-muted-foreground">price updates this week</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="recent-products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent-products">Recent Products</TabsTrigger>
            <TabsTrigger value="price-changes">Price Changes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent-products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recently Updated Products</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/products')}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="price-changes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Price Changes</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/price-history')}
              >
                View History
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentPriceChanges.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(product.currentPrice)}
                        </div>
                        
                        <div className={`flex items-center justify-end text-sm ${
                          product.change > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {product.change > 0 ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          )}
                          
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            signDisplay: 'always',
                          }).format(product.change)}
                          
                          <span className="ml-1">
                            ({product.percentChange.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {recentPriceChanges.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No recent price changes to display
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
