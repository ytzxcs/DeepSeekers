
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import ProductsTable from '@/components/ProductsTable';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold">Products</h2>
          <Button className="flex items-center gap-2">
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
        <ProductsTable searchQuery={searchQuery} />
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
