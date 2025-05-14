
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProductAuditTrail from '@/components/ProductAuditTrail';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

const AdminPage = () => {
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState("all");
  
  if (permissionsLoading) {
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
          <h1 className="text-3xl font-bold mb-2">
            {isAdmin ? "Product Audit Trail" : "Product Status History"}
          </h1>
          <p className="text-gray-500">
            {isAdmin 
              ? "Monitor all product changes with detailed admin information"
              : "View product status changes"
            }
          </p>
        </div>
        
        {isAdmin && (
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
        )}
        
        {!isAdmin && (
          <ProductAuditTrail isAdminView={false} groupByAdmin={false} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
