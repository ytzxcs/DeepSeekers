
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, User } from 'lucide-react';
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
      setAuditTrail(data || []);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Audit Trail</h2>
          <p className="text-muted-foreground">
            Track all product changes including soft deletes
          </p>
        </div>
        
        <div className="flex space-x-2">
          {uniqueUsers.map(username => (
            <button
              key={username}
              onClick={() => filterByUser(username)}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                currentUserFilter === username 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <User className="h-3 w-3 mr-1" />
              {username}
            </button>
          ))}
        </div>
      </div>

      {currentUserFilter && (
        <div className="bg-muted p-3 rounded-md">
          <p className="font-medium">
            Showing actions by: {currentUserFilter}
            <button 
              onClick={() => setCurrentUserFilter(null)}
              className="text-primary text-sm ml-2 hover:underline"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Change History</CardTitle>
          <CardDescription>
            Complete history of all product modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditTrail.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No audit trail records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAuditTrail.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.product_name}
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          record.action === 'ADDED' 
                            ? 'bg-green-100 text-green-800'
                            : record.action === 'EDITED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.timestamp), 'yyyy-MMM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>{record.performed_by}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAuditTrail;
