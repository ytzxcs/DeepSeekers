
import DashboardLayout from '@/components/DashboardLayout';
import ProductAuditTrail from '@/components/ProductAuditTrail';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <ProductAuditTrail />
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
