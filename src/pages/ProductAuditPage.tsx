
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, Edit, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ProductAudit } from '@/types';

const ProductAuditPage = () => {
  const [loading, setLoading] = useState(true);
  const [auditRecords, setAuditRecords] = useState<ProductAudit[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditRecords();
  }, []);

  const fetchAuditRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_audit')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setAuditRecords(data as ProductAudit[]);
    } catch (error: any) {
      console.error('Error fetching audit records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch audit records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique admin users for grouping
  const uniqueAdmins = Array.from(new Set(auditRecords.map(record => record.performed_by)));

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ADDED':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'EDITED':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'DELETED':
        return <X className="h-4 w-4 text-red-500" />;
      case 'RECOVERED':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (action: string) => {
    switch (action) {
      case 'ADDED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Added</Badge>;
      case 'EDITED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Edited</Badge>;
      case 'DELETED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Deleted</Badge>;
      case 'RECOVERED':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Recovered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Product Audit Trail</h1>
          <p className="text-gray-500">
            Monitor all product changes with detailed admin information
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Changes</TabsTrigger>
            <TabsTrigger value="by-admin">Group By Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Complete Audit Trail</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Product</TableHead>
                      <TableHead className="w-1/4">Status</TableHead>
                      <TableHead className="w-1/4">User</TableHead>
                      <TableHead className="w-1/4">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.product_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(record.action)}
                              {getStatusBadge(record.action)}
                            </div>
                          </TableCell>
                          <TableCell>{record.performed_by}</TableCell>
                          <TableCell>
                            {format(new Date(record.timestamp), 'yyyy-MM-dd h:mm a')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-admin" className="mt-4">
            <div className="space-y-8">
              {uniqueAdmins.map(admin => {
                const adminRecords = auditRecords.filter(record => record.performed_by === admin);
                
                if (adminRecords.length === 0) return null;
                
                return (
                  <Card key={admin} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle>Soft Delete POV: {admin}</CardTitle>
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
                                <div className="flex items-center gap-2">
                                  {getActionIcon(record.action)}
                                  {getStatusBadge(record.action)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {format(new Date(record.timestamp), 'yyyy-MM-dd h:mm a')}
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProductAuditPage;
