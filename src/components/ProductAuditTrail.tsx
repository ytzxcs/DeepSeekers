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
import { Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProductAudit } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProducts } from '@/contexts/ProductContext';

interface ProductAuditTrailProps {
  isAdminView?: boolean;
  groupByAdmin?: boolean;
}

const ProductAuditTrail = ({ isAdminView = false, groupByAdmin = false }: ProductAuditTrailProps) => {
  const [auditTrail, setAuditTrail] = useState<ProductAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ProductAudit | null>(null);
  const { toast } = useToast();
  const { getProduct, updateProduct, deleteProduct, recoverProduct } = useProducts();

  useEffect(() => {
    fetchAuditTrail();

    // Set up realtime subscription
    const channel = supabase
      .channel('product-audit-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'product_audit' 
        },
        () => {
          // Refresh data when audit trail changes
          fetchAuditTrail();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleDeleteAudit = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('product_audit')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Audit record deleted successfully",
      });
      
      // Refresh the data
      fetchAuditTrail();
    } catch (error: any) {
      console.error('Error deleting audit record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete audit record",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openRestoreDialog = (audit: ProductAudit) => {
    setSelectedAudit(audit);
    setRestoreDialogOpen(true);
  };

  const handleRestoreChange = async () => {
    if (!selectedAudit) return;
    
    try {
      const product = getProduct(selectedAudit.product_id);
      
      // Based on the action type, restore to previous state
      switch (selectedAudit.action) {
        case 'ADDED':
          // If product was added, we should delete it to revert
          await deleteProduct(selectedAudit.product_id);
          break;
        case 'DELETED':
          // If product was deleted, we should recover it
          await recoverProduct(selectedAudit.product_id);
          break;
        case 'EDITED':
          // For edits, we'd need historical data to properly revert
          // This is a simplified implementation
          if (product) {
            await updateProduct(selectedAudit.product_id, {
              name: selectedAudit.product_name
            });
          }
          break;
        default:
          break;
      }

      toast({
        title: "Success",
        description: `Change for ${selectedAudit.product_name} has been restored`,
      });
    } catch (error: any) {
      console.error('Error restoring change:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore change",
        variant: "destructive"
      });
    } finally {
      setRestoreDialogOpen(false);
      setSelectedAudit(null);
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

  // Helper function to get status color class
  const getStatusColorClass = (action: string): string => {
    if (!isAdminView) return 'text-foreground'; // No colors for regular users
    
    switch (action) {
      case 'DELETED':
        return 'text-red-500 font-medium';
      case 'EDITED':
        return 'text-blue-500 font-medium';
      case 'RECOVERED':
        return 'text-amber-500 font-medium';
      case 'ADDED':
        return 'text-green-500 font-medium';
      default:
        return 'text-foreground';
    }
  };

  const renderActionButtons = (record: ProductAudit) => {
    if (!isAdminView) return null;
    
    return (
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => openRestoreDialog(record)}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Restore
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => {
            setDeletingId(record.id);
            setConfirmDialogOpen(true);
          }}
          disabled={deletingId === record.id}
        >
          {deletingId === record.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  // Standard view for both regular users and admins when not grouping
  if (!groupByAdmin) {
    return (
      <>
        <Card>
          <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
            <CardTitle>{isAdminView ? "Admin Product Audit Trail" : "Product Status Changes"}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchAuditTrail} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/5">Product</TableHead>
                  <TableHead className="w-1/5">Status</TableHead>
                  {isAdminView && <TableHead className="w-1/5">Performed By</TableHead>}
                  <TableHead className="w-1/5">Timestamp</TableHead>
                  {isAdminView && <TableHead className="w-1/5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditTrail.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.product_name}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusColorClass(record.action)}>
                        {record.action}
                      </span>
                    </TableCell>
                    {isAdminView && (
                      <TableCell>{record.performed_by}</TableCell>
                    )}
                    <TableCell>
                      {format(new Date(record.timestamp), 'yyyy-MMM-dd h:mm a')}
                    </TableCell>
                    {isAdminView && (
                      <TableCell className="text-right">
                        {renderActionButtons(record)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {auditTrail.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdminView ? 5 : 3} className="text-center py-4 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Audit Record</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this audit record? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (deletingId) handleDeleteAudit(deletingId);
                  setConfirmDialogOpen(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Restore Confirmation Dialog */}
        <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore Product Change</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedAudit && (
                  <>
                    Do you want to restore/rollback this change for <strong>{selectedAudit.product_name}</strong>?
                    <br />
                    Action: <strong>{selectedAudit.action}</strong>
                    <br />
                    Performed by: <strong>{selectedAudit.performed_by}</strong>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRestoreChange}>
                Restore
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Admin-only view with grouping by admin user
  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchAuditTrail} className="gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {uniqueAdmins.map(admin => {
        const adminRecords = auditTrail.filter(record => record.performed_by === admin);
        
        if (adminRecords.length === 0) return null;
        
        return (
          <Card key={admin} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Product Activity: {admin}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Product</TableHead>
                    <TableHead className="w-1/4">Status</TableHead>
                    <TableHead className="w-1/4">Timestamp</TableHead>
                    <TableHead className="w-1/4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.product_name}
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColorClass(record.action)}>
                          {record.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.timestamp), 'yyyy-MMM-dd h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderActionButtons(record)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audit Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this audit record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletingId) handleDeleteAudit(deletingId);
                setConfirmDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Product Change</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAudit && (
                <>
                  Do you want to restore/rollback this change for <strong>{selectedAudit.product_name}</strong>?
                  <br />
                  Action: <strong>{selectedAudit.action}</strong>
                  <br />
                  Performed by: <strong>{selectedAudit.performed_by}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreChange}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductAuditTrail;
