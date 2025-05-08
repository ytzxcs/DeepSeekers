
import DashboardLayout from '@/components/DashboardLayout';
import ProductAuditTrail from '@/components/ProductAuditTrail';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Product Audit Trail</h1>
        <ProductAuditTrail />
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
