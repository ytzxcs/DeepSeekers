
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, Edit, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ProductAudit } from '@/types';
import ProductAuditTrail from '@/components/ProductAuditTrail';

const ProductAuditPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Just a small delay to ensure the component is mounted
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Product Audit Trail</h1>
          <p className="text-gray-500">
            Monitor all product changes with detailed admin information
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Changes</TabsTrigger>
            <TabsTrigger value="by-admin">Group By Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ProductAuditTrail isAdminView={true} groupByAdmin={false} />
          </TabsContent>

          <TabsContent value="by-admin" className="mt-4">
            <ProductAuditTrail isAdminView={true} groupByAdmin={true} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProductAuditPage;
