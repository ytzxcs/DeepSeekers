
import DashboardLayout from '@/components/DashboardLayout';
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import {
  BarChart3,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DashboardPage = () => {
  const { products } = useProducts();
  const navigate = useNavigate();

  // Calculate data for dashboard
  const totalProducts = products.length;
  const averagePrice = products.reduce((sum, product) => sum + product.currentPrice, 0) / 
    (totalProducts || 1);
  
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

  // Calculate category distribution
  const categories = products.reduce((acc: Record<string, number>, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  // Sort categories by count
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate total inventory value
  const totalValue = products.reduce((sum, product) => sum + product.currentPrice, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome to your product management dashboard.
          </p>
        </div>

        {/* Main stats cards - top row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">inventory items</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(averagePrice)}
              </div>
              <p className="text-xs text-muted-foreground">per product</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Price Changes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentPriceChanges.length}</div>
              <p className="text-xs text-muted-foreground">in last period</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">inventory worth</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{count} items</span>
                  </div>
                  <Progress value={(count / totalProducts) * 100} className="h-2" />
                </div>
              ))}
              {sortedCategories.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No categories to display
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            </CardFooter>
          </Card>

          {/* Main content area with tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="recent-products">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="recent-products">Recent Products</TabsTrigger>
                  <TabsTrigger value="price-changes">Price Changes</TabsTrigger>
                  <TabsTrigger value="all-products">All Products</TabsTrigger>
                </TabsList>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/products')}
                >
                  View All
                </Button>
              </div>

              <TabsContent value="recent-products" className="mt-6 space-y-4">
                {recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No products available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="price-changes" className="mt-6 space-y-4">
                {recentPriceChanges.length > 0 ? (
                  recentPriceChanges.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                              <img 
                                src={product.imageUrl || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'} 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9';
                                }}
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
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No price changes to display
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all-products" className="mt-6">
                {products.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {products.map((product) => (
                        <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                            <ProductCard product={product} />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-center mt-4">
                      <CarouselPrevious className="static translate-y-0 mr-2" />
                      <CarouselNext className="static translate-y-0" />
                    </div>
                  </Carousel>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No products available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
