
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Loader2 } from 'lucide-react';
import { UserPermissions } from '@/contexts/PermissionsContext';

const UserManagement = () => {
  const [users, setUsers] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPermissions | null>(null);
  const [newUser, setNewUser] = useState({
    user_name: '',
    edit_product: false,
    delete_product: false,
    add_product: false,
    edit_price_history: false,
    delete_price_history: false,
    add_price_history: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('user_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.user_name.trim()) {
      toast({
        title: "Error",
        description: "User name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_name', newUser.user_name.trim());

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Error",
          description: "A user with this name already exists",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_permissions')
        .insert([
          {
            user_name: newUser.user_name.trim(),
            edit_product: newUser.edit_product,
            delete_product: newUser.delete_product,
            add_product: newUser.add_product,
            edit_price_history: newUser.edit_price_history,
            delete_price_history: newUser.delete_price_history,
            add_price_history: newUser.add_price_history,
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added successfully"
      });
      
      setIsAddDialogOpen(false);
      setNewUser({
        user_name: '',
        edit_product: false,
        delete_product: false,
        add_product: false,
        edit_price_history: false,
        delete_price_history: false,
        add_price_history: false
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .update({
          edit_product: selectedUser.edit_product,
          delete_product: selectedUser.delete_product,
          add_product: selectedUser.add_product,
          edit_price_history: selectedUser.edit_price_history,
          delete_price_history: selectedUser.delete_price_history,
          add_price_history: selectedUser.add_price_history,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user permissions",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user: UserPermissions) => {
    setSelectedUser({...user});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserPermissions) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Manage user access to product and price history operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Edit Product</TableHead>
                <TableHead>Delete Product</TableHead>
                <TableHead>Add Product</TableHead>
                <TableHead>Edit Price History</TableHead>
                <TableHead>Delete Price History</TableHead>
                <TableHead>Add Price History</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.user_name}</TableCell>
                    <TableCell>{user.edit_product ? "YES" : "NO"}</TableCell>
                    <TableCell>{user.delete_product ? "YES" : "NO"}</TableCell>
                    <TableCell>{user.add_product ? "YES" : "NO"}</TableCell>
                    <TableCell>{user.edit_price_history ? "YES" : "NO"}</TableCell>
                    <TableCell>{user.delete_price_history ? "YES" : "NO"}</TableCell>
                    <TableCell>{user.add_price_history ? "YES" : "NO"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(user)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">User Name</Label>
              <Input
                id="user-name"
                placeholder="Enter user name"
                value={newUser.user_name}
                onChange={(e) => setNewUser({...newUser, user_name: e.target.value})}
              />
            </div>
            <div className="grid gap-6 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-product">Can Add Product</Label>
                <Switch
                  id="add-product"
                  checked={newUser.add_product}
                  onCheckedChange={(checked) => setNewUser({...newUser, add_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-product">Can Edit Product</Label>
                <Switch
                  id="edit-product"
                  checked={newUser.edit_product}
                  onCheckedChange={(checked) => setNewUser({...newUser, edit_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="delete-product">Can Delete Product</Label>
                <Switch
                  id="delete-product"
                  checked={newUser.delete_product}
                  onCheckedChange={(checked) => setNewUser({...newUser, delete_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="add-price-history">Can Add Price History</Label>
                <Switch
                  id="add-price-history"
                  checked={newUser.add_price_history}
                  onCheckedChange={(checked) => setNewUser({...newUser, add_price_history: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-price-history">Can Edit Price History</Label>
                <Switch
                  id="edit-price-history"
                  checked={newUser.edit_price_history}
                  onCheckedChange={(checked) => setNewUser({...newUser, edit_price_history: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="delete-price-history">Can Delete Price History</Label>
                <Switch
                  id="delete-price-history"
                  checked={newUser.delete_price_history}
                  onCheckedChange={(checked) => setNewUser({...newUser, delete_price_history: checked})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update permissions for {selectedUser?.user_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-add-product">Can Add Product</Label>
                <Switch
                  id="edit-add-product"
                  checked={selectedUser.add_product}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, add_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-edit-product">Can Edit Product</Label>
                <Switch
                  id="edit-edit-product"
                  checked={selectedUser.edit_product}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, edit_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-delete-product">Can Delete Product</Label>
                <Switch
                  id="edit-delete-product"
                  checked={selectedUser.delete_product}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, delete_product: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-add-price-history">Can Add Price History</Label>
                <Switch
                  id="edit-add-price-history"
                  checked={selectedUser.add_price_history}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, add_price_history: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-edit-price-history">Can Edit Price History</Label>
                <Switch
                  id="edit-edit-price-history"
                  checked={selectedUser.edit_price_history}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, edit_price_history: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-delete-price-history">Can Delete Price History</Label>
                <Switch
                  id="edit-delete-price-history"
                  checked={selectedUser.delete_price_history}
                  onCheckedChange={(checked) => setSelectedUser({...selectedUser, delete_price_history: checked})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {selectedUser && ` "${selectedUser.user_name}"`} and remove their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
