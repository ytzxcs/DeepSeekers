
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Loader2 } from 'lucide-react';
import ProductAuditHeader from '@/components/ProductAuditHeader';
import ProductAuditTabs from '@/components/ProductAuditTabs';

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
        <ProductAuditHeader />
        <ProductAuditTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DashboardLayout>
  );
};

export default ProductAuditPage;
