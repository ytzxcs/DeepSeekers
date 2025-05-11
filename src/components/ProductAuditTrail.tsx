
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 border-b">
          <h2 className="text-lg font-medium">ADMIN PAGE</h2>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium text-red-500">Status</TableHead>
              <TableHead className="font-medium">Stamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditTrail.map((record) => (
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
                  {record.performed_by} {format(new Date(record.timestamp), 'yyyy/MMM/dd - h:mm a')}
                </TableCell>
              </TableRow>
            ))}
            {auditTrail.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductAuditTrail;
