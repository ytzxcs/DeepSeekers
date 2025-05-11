
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
  action: 'ADDED' | 'EDITED' | 'DELETED' | 'RECOVERED';
  performed_by: string;
  timestamp: string;
}

const ProductAuditTrail = () => {
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

  // Get unique users for grouping
  const uniqueUsers = Array.from(new Set(auditTrail.map(item => item.performed_by)));
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {uniqueUsers.map(username => (
        <div key={username} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h2 className="text-lg font-medium">
              Only soft Delete POV {username}
            </h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 font-medium">Product</TableHead>
                <TableHead className="w-1/3 font-medium text-red-500">Status (Hidden to users)</TableHead>
                <TableHead className="w-1/3 font-medium">Stamp (hidden to users)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditTrail
                .filter(record => record.performed_by === username)
                .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.product_name}
                    </TableCell>
                    <TableCell className={`${
                      record.action === 'DELETED' ? 'text-red-500' : 
                      record.action === 'EDITED' ? 'text-blue-500' : 
                      record.action === 'RECOVERED' ? 'text-amber-500' :
                      'text-green-500'
                    }`}>
                      {record.action}
                    </TableCell>
                    <TableCell>
                      {record.performed_by} {format(new Date(record.timestamp), 'yyyy-MMM-dd HH:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              {auditTrail.filter(record => record.performed_by === username).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ))}
      
      {auditTrail.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No audit records found in the system
        </div>
      )}
    </div>
  );
};

export default ProductAuditTrail;
