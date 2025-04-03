
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import DashboardLayout from '@/components/DashboardLayout';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ArrowLeftIcon, 
  EditIcon, 
  Trash2Icon, 
  Clock, 
  Package,
  DollarSign, 
  CalendarIcon 
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const navigate = useNavigate();
  const product = getProduct(id || '');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('all');

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation and actions */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Products
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <EditIcon className="h-4 w-4" /> 
              Edit
            </Button>
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
            >
              <Trash2Icon className="h-4 w-4" /> 
              Delete
            </Button>
          </div>
        </div>

        {/* Product header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge>{product.category}</Badge>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-2">
                  <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(product.currentPrice)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {format(new Date(product.createdAt), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {format(new Date(product.updatedAt), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Price history chart */}
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Track how the price has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <TabsList>
                <TabsTrigger 
                  value="7days" 
                  onClick={() => setTimeRange('7days')}
                  className={timeRange === '7days' ? 'bg-primary text-primary-foreground' : ''}
                >
                  7 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="30days" 
                  onClick={() => setTimeRange('30days')}
                  className={timeRange === '30days' ? 'bg-primary text-primary-foreground' : ''}
                >
                  30 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="90days" 
                  onClick={() => setTimeRange('90days')}
                  className={timeRange === '90days' ? 'bg-primary text-primary-foreground' : ''}
                >
                  90 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  onClick={() => setTimeRange('all')}
                  className={timeRange === 'all' ? 'bg-primary text-primary-foreground' : ''}
                >
                  All Time
                </TabsTrigger>
              </TabsList>
            </div>
            <PriceHistoryChart priceHistory={product.priceHistory} timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Price history table */}
        <Card>
          <CardHeader>
            <CardTitle>Price Changes</CardTitle>
            <CardDescription>Detailed history of all price adjustments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">Date</th>
                    <th className="h-10 px-4 text-left font-medium">Price</th>
                    <th className="h-10 px-4 text-left font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {product.priceHistory.map((point, index) => {
                    const prevPrice = index > 0 ? product.priceHistory[index - 1].price : null;
                    const change = prevPrice !== null ? point.price - prevPrice : null;
                    const percentChange = prevPrice !== null ? (change! / prevPrice) * 100 : null;
                    
                    return (
                      <tr key={point.date} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(point.date), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(point.price)}
                        </td>
                        <td className="p-4 align-middle">
                          {change !== null ? (
                            <span className={`flex items-center ${
                              change > 0 
                                ? 'text-red-600' 
                                : change < 0 
                                  ? 'text-green-600' 
                                  : 'text-muted-foreground'
                            }`}>
                              {change !== 0 && (
                                change > 0 
                                  ? <ArrowLeftIcon className="h-3 w-3 rotate-90 mr-1" />
                                  : <ArrowLeftIcon className="h-3 w-3 -rotate-90 mr-1" />
                              )}
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                signDisplay: 'always',
                              }).format(change)}
                              {' '}
                              <span className="text-muted-foreground ml-1">
                                ({percentChange?.toFixed(1)}%)
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Initial price</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetailPage;
