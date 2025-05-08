
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/contexts/PermissionsContext';

interface PriceHistoryItem {
  effdate: string;
  unitprice: number;
  prodcode: string;
}

interface ProductWithPrice {
  prodcode: string;
  description: string;
  unit: string;
  currentPrice: number | null;
  latestPriceDate: string | null;
}

interface PriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithPrice;
  onClose: () => void;
}

const PriceHistoryDialog = ({
  open,
  onOpenChange,
  product,
  onClose,
}: PriceHistoryDialogProps) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceHistoryItem | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { canEditPriceHistory, canDeletePriceHistory, canAddPriceHistory } = usePermissions();

  useEffect(() => {
    if (open && product) {
      fetchPriceHistory();
    }
  }, [open, product]);

  const fetchPriceHistory = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricehist')
        .select('*')
        .eq('prodcode', product.prodcode)
        .order('effdate', { ascending: false });

      if (error) throw error;
      setPriceHistory(data || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch price history.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrice = async () => {
    if (!canAddPriceHistory) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add price history",
        variant: "destructive"
      });
      return;
    }

    if (!newPrice || !newDate) {
      toast({
        title: 'Error',
        description: 'Please enter both price and date',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('pricehist').insert({
        prodcode: product.prodcode,
        unitprice: price,
        effdate: format(newDate, 'yyyy-MM-dd'),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Price history updated successfully',
      });

      // Refresh price history
      fetchPriceHistory();
      setIsAddingPrice(false);
      setNewPrice('');
      setNewDate(new Date());
    } catch (error) {
      console.error('Error adding price:', error);
      toast({
        title: 'Error',
        description: 'Failed to add new price',
        variant: 'destructive',
      });
    }
  };

  const handleEditPrice = async () => {
    if (!canEditPriceHistory) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit price history",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPrice || !newPrice || !newDate) {
      toast({
        title: 'Error',
        description: 'Please enter both price and date',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pricehist')
        .update({
          unitprice: price,
          effdate: format(newDate, 'yyyy-MM-dd'),
        })
        .eq('prodcode', selectedPrice.prodcode)
        .eq('effdate', selectedPrice.effdate);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Price updated successfully',
      });

      // Refresh price history
      fetchPriceHistory();
      setIsEditingPrice(false);
      setSelectedPrice(null);
      setNewPrice('');
      setNewDate(new Date());
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update price',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePrice = async () => {
    if (!canDeletePriceHistory) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete price history",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPrice) return;

    try {
      const { error } = await supabase
        .from('pricehist')
        .delete()
        .eq('prodcode', selectedPrice.prodcode)
        .eq('effdate', selectedPrice.effdate);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Price deleted successfully',
      });

      // Refresh price history
      fetchPriceHistory();
      setDeleteDialogOpen(false);
      setSelectedPrice(null);
    } catch (error) {
      console.error('Error deleting price:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete price',
        variant: 'destructive',
      });
    }
  };

  const startEditPrice = (price: PriceHistoryItem) => {
    if (!canEditPriceHistory) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit price history",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedPrice(price);
    setNewPrice(price.unitprice.toString());
    setNewDate(new Date(price.effdate));
    setIsEditingPrice(true);
  };

  const confirmDeletePrice = (price: PriceHistoryItem) => {
    if (!canDeletePriceHistory) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete price history",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedPrice(price);
    setDeleteDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {product?.description || product?.prodcode} - Price History
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Code: <span className="font-medium text-foreground">{product?.prodcode}</span></p>
                <p className="text-sm text-muted-foreground">Current Price: <span className="font-medium text-foreground">{product?.currentPrice !== null ? formatPrice(product.currentPrice) : 'N/A'}</span></p>
              </div>
              {canAddPriceHistory && (
                <Button onClick={() => setIsAddingPrice(true)}>Add New Price</Button>
              )}
            </div>
            
            <Tabs defaultValue="history">
              <TabsList className="mb-4">
                <TabsTrigger value="history">Price History</TabsTrigger>
                {isAddingPrice && <TabsTrigger value="add">Add Price</TabsTrigger>}
                {isEditingPrice && <TabsTrigger value="edit">Edit Price</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="history">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No price history available
                          </TableCell>
                        </TableRow>
                      ) : (
                        priceHistory.map((price) => (
                          <TableRow key={price.effdate}>
                            <TableCell>{format(new Date(price.effdate), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{formatPrice(price.unitprice)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {canEditPriceHistory && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => startEditPrice(price)}
                                  >
                                    Edit
                                  </Button>
                                )}
                                {canDeletePriceHistory && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => confirmDeletePrice(price)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="add">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-price">Price</Label>
                      <Input
                        id="new-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Effective Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {newDate ? format(newDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newDate}
                            onSelect={setNewDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsAddingPrice(false)}>Cancel</Button>
                      <Button onClick={handleAddPrice}>Add Price</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="edit">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Price</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Effective Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {newDate ? format(newDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={newDate}
                            onSelect={setNewDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsEditingPrice(false)}>Cancel</Button>
                      <Button onClick={handleEditPrice}>Update Price</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the price history entry from {selectedPrice ? format(new Date(selectedPrice.effdate), 'MMM d, yyyy') : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrice} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PriceHistoryDialog;
