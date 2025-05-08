
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProductAudit {
  id: string;
  product_id: string;
  product_name: string;
  action: 'ADDED' | 'EDITED' | 'DELETED';
  performed_by: string;
  timestamp: string;
}

const ProductAuditTrail = () => {
  const [auditTrail, setAuditTrail] = useState<ProductAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserFilter, setCurrentUserFilter] = useState<string | null>(null);
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
      
      // Properly cast the data to the ProductAudit type
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

  const filterByUser = (username: string) => {
    if (currentUserFilter === username) {
      setCurrentUserFilter(null); // Clear filter if clicking the same user
    } else {
      setCurrentUserFilter(username);
    }
  };

  // Get unique users for filtering
  const uniqueUsers = Array.from(new Set(auditTrail.map(item => item.performed_by)));
  
  // Filter audit trail by user if filter is active
  const filteredAuditTrail = currentUserFilter
    ? auditTrail.filter(item => item.performed_by === currentUserFilter)
    : auditTrail;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uniqueUsers.map(username => (
        <div key={username} className="space-y-4">
          <h2 className="text-lg font-bold">
            Only soft Delete POV {username}
          </h2>
          
          <Table className="border-collapse border">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold">Product</TableHead>
                <TableHead className="border font-bold text-red-500">Status</TableHead>
                <TableHead className="border font-bold">Stamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditTrail.length === 0 || (currentUserFilter && currentUserFilter !== username) ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                (currentUserFilter === username || !currentUserFilter ? 
                  filteredAuditTrail.filter(record => record.performed_by === username) : [])
                  .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="border">
                      {record.product_name}
                    </TableCell>
                    <TableCell className={`border ${
                      record.action === 'DELETED' ? 'text-red-500' : 
                      record.action === 'EDITED' ? 'text-blue-500' : 
                      'text-green-500'
                    }`}>
                      {record.action}
                    </TableCell>
                    <TableCell className="border">
                      {record.performed_by} {format(new Date(record.timestamp), 'yyyy-MMM-dd HH:mm a')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default ProductAuditTrail;
