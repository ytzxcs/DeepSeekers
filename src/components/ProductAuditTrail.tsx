
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProductAudit {
  id: string;
  product_id: string;
  product_name: string;
  action: 'ADDED' | 'EDITED' | 'DELETED' | 'RECOVERED';
  performed_by: string;
  timestamp: string;
}

interface ProductAuditTrailProps {
  isAdminView?: boolean;
  groupByAdmin?: boolean;
}

const ProductAuditTrail = ({ isAdminView = false, groupByAdmin = false }: ProductAuditTrailProps) => {
  const [auditTrail, setAuditTrail] = useState<ProductAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_audit')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setAuditTrail(data as ProductAudit[]);
    } catch (error: any) {
      console.error('Error fetching audit trail:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch audit trail",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique admin users for grouping
  const uniqueAdmins = Array.from(new Set(auditTrail.map(item => item.performed_by)));
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Standard view for both regular users and admins when not grouping
  if (!groupByAdmin) {
    return (
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>{isAdminView ? "Admin Product Audit Trail" : "Product Status Changes"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Product</TableHead>
                <TableHead className="w-1/4">Status</TableHead>
                {isAdminView && <TableHead className="w-1/4">User</TableHead>}
                <TableHead className="w-1/4">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditTrail.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.product_name}
                  </TableCell>
                  <TableCell>
                    <span className={isAdminView ? 
                      `font-medium ${
                        record.action === 'DELETED' ? 'text-red-500' : 
                        record.action === 'EDITED' ? 'text-blue-500' : 
                        record.action === 'RECOVERED' ? 'text-amber-500' :
                        'text-green-500'
                      }` : 'font-medium'}>
                      {record.action}
                    </span>
                  </TableCell>
                  {isAdminView && (
                    <TableCell>{record.performed_by}</TableCell>
                  )}
                  <TableCell>
                    {format(new Date(record.timestamp), 'yyyy-MMM-dd h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
              {auditTrail.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdminView ? 4 : 3} className="text-center py-4 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Admin-only view with grouping by admin user
  return (
    <div className="space-y-8">
      {uniqueAdmins.map(admin => {
        const adminRecords = auditTrail.filter(record => record.performed_by === admin);
        
        if (adminRecords.length === 0) return null;
        
        return (
          <Card key={admin} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Actions by {admin}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Product</TableHead>
                    <TableHead className="w-1/3">Status</TableHead>
                    <TableHead className="w-1/3">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.product_name}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          record.action === 'DELETED' ? 'text-red-500' : 
                          record.action === 'EDITED' ? 'text-blue-500' : 
                          record.action === 'RECOVERED' ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {record.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.timestamp), 'yyyy-MMM-dd h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      
      {uniqueAdmins.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audit records found in the system
        </div>
      )}
    </div>
  );
};

export default ProductAuditTrail;
