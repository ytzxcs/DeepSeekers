
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductAuditTrail from '@/components/ProductAuditTrail';

interface ProductAuditTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const ProductAuditTabs = ({ activeTab, onTabChange }: ProductAuditTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
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
  );
};

export default ProductAuditTabs;
