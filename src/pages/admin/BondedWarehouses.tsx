import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

async function fetchBondedWarehouses() {
  const { data, error } = await supabase
    .from("bonded_warehouses")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export default function BondedWarehouses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_person: "",
    email: "",
    phone: "",
    is_active: true,
  });

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["bonded_warehouses"],
    queryFn: fetchBondedWarehouses,
  });

  const updateMutation = useMutation({
    mutationFn: async (warehouse: any) => {
      const { error } = await supabase
        .from("bonded_warehouses")
        .update({
          name: warehouse.name,
          address: warehouse.address,
          contact_person: warehouse.contact_person,
          email: warehouse.email,
          phone: warehouse.phone,
          is_active: warehouse.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", warehouse.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonded_warehouses"] });
      toast({ title: "Success", description: "Bonded warehouse updated successfully" });
      setEditDialogOpen(false);
      setEditingWarehouse(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update warehouse", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bonded_warehouses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonded_warehouses"] });
      toast({ title: "Success", description: "Bonded warehouse deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete warehouse", variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (warehouse: any) => {
      const { error } = await supabase.from("bonded_warehouses").insert(warehouse);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonded_warehouses"] });
      toast({ title: "Success", description: "Bonded warehouse added successfully" });
      setAddDialogOpen(false);
      setFormData({ name: "", address: "", contact_person: "", email: "", phone: "", is_active: true });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add warehouse", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("bonded_warehouses")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonded_warehouses"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    },
  });

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name || "",
      address: warehouse.address || "",
      contact_person: warehouse.contact_person || "",
      email: warehouse.email || "",
      phone: warehouse.phone || "",
      is_active: warehouse.is_active ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingWarehouse) return;
    if (!formData.name.trim()) {
      toast({ title: "Name required", description: "Please enter a warehouse name", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ ...editingWarehouse, ...formData });
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({ title: "Name required", description: "Please enter a warehouse name", variant: "destructive" });
      return;
    }
    addMutation.mutate(formData);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete bonded warehouse "${name}"? This action cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, is_active: !currentStatus });
  };

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Bonded Warehouses Management</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : warehouses && warehouses.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Contact Person</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Phone</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse: any) => (
                    <tr key={warehouse.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{warehouse.name}</td>
                      <td className="p-4">{warehouse.contact_person || "—"}</td>
                      <td className="p-4">{warehouse.email || "—"}</td>
                      <td className="p-4">{warehouse.phone || "—"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={warehouse.is_active ?? true}
                            onCheckedChange={() => handleToggleActive(warehouse.id, warehouse.is_active ?? true)}
                            disabled={toggleActiveMutation.isPending}
                          />
                          <span className="text-sm text-muted-foreground">
                            {warehouse.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(warehouse)}
                            className="gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(warehouse.id, warehouse.name)}
                            className="gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {warehouses.map((warehouse: any) => (
                <div key={warehouse.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{warehouse.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {warehouse.contact_person && (
                          <div>Contact: {warehouse.contact_person}</div>
                        )}
                        {warehouse.email && (
                          <div>Email: {warehouse.email}</div>
                        )}
                        {warehouse.phone && (
                          <div>Phone: {warehouse.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={warehouse.is_active ?? true}
                        onCheckedChange={() => handleToggleActive(warehouse.id, warehouse.is_active ?? true)}
                        disabled={toggleActiveMutation.isPending}
                      />
                      <span className="text-sm text-muted-foreground">
                        {warehouse.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(warehouse)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(warehouse.id, warehouse.name)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No bonded warehouses configured</div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bonded Warehouse</DialogTitle>
            <DialogDescription>Update warehouse information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Warehouse Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Bonded Warehouse</DialogTitle>
            <DialogDescription>Add a new bonded warehouse to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Warehouse Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., London Bonded Warehouse"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

