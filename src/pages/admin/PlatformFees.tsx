import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { getAllPlatformFees, updatePlatformFee, deletePlatformFee } from "@/lib/fees";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const SUBCATEGORIES: Record<string, string[]> = {
  Beer: ['craft', 'low/no alcohol'],
  Wine: ['port', 'sparkling wine', 'fortified', 'mixed'],
  Spirits: ['Gin', 'liqueur', 'pastis', 'whiskey', 'mezcal', 'rum', 'vodka', 'cognac/brandy', 'tequila', 'armagnac', 'other'],
  Champagne: ['Vintage', 'Non-Vintage', 'Rose', 'other'],
  Other: ['Absinthe', 'Calvados', 'Non Alcoholic', 'Grappa', 'Raki', 'Sake', 'Mixed cocktails', 'other'],
  'Soft Drinks': [],
};

const CATEGORIES = ['Beer', 'Wine', 'Spirits', 'Champagne', 'Soft Drinks', 'Other'];

async function fetchPlatformFees() {
  return await getAllPlatformFees();
}

export default function PlatformFees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<{ id?: string; category: string; subcategory: string | null; fee_amount: number } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState<string | null>(null);
  const [newFeeAmount, setNewFeeAmount] = useState("3.00");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const { data: fees, isLoading } = useQuery({
    queryKey: ["platform_fees"],
    queryFn: fetchPlatformFees,
  });

  // Group fees by category
  const feesByCategory = useMemo(() => {
    if (!fees) return {};
    const grouped: Record<string, Array<{ id?: string; category: string; subcategory: string | null; fee_amount: number }>> = {};
    
    fees.forEach((fee: any) => {
      const cat = fee.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id: fee.id,
        category: fee.category,
        subcategory: fee.subcategory,
        fee_amount: fee.fee_amount,
      });
    });

    // Sort subcategories within each category
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => {
        if (a.subcategory === null && b.subcategory !== null) return -1;
        if (a.subcategory !== null && b.subcategory === null) return 1;
        if (a.subcategory === null && b.subcategory === null) return 0;
        return (a.subcategory || '').localeCompare(b.subcategory || '');
      });
    });

    return grouped;
  }, [fees]);

  const updateMutation = useMutation({
    mutationFn: async ({ category, subcategory, feeAmount }: { category: string; subcategory: string | null; feeAmount: number }) => {
      await updatePlatformFee(category, subcategory, feeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_fees"] });
      toast({ title: "Success", description: "Platform fee updated successfully" });
      setEditDialogOpen(false);
      setEditingFee(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update fee", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ category, subcategory }: { category: string; subcategory: string | null }) => {
      await deletePlatformFee(category, subcategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_fees"] });
      toast({ title: "Success", description: "Platform fee deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete fee", variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ category, subcategory, feeAmount }: { category: string; subcategory: string | null; feeAmount: number }) => {
      await updatePlatformFee(category, subcategory, feeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_fees"] });
      toast({ title: "Success", description: "Platform fee added successfully" });
      setAddDialogOpen(false);
      setNewCategory("");
      setNewSubcategory(null);
      setNewFeeAmount("3.00");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add fee", variant: "destructive" });
    },
  });

  const handleEdit = (fee: any) => {
    setEditingFee({ id: fee.id, category: fee.category, subcategory: fee.subcategory, fee_amount: fee.fee_amount });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingFee) return;
    const feeAmount = parseFloat(editingFee.fee_amount.toString());
    if (isNaN(feeAmount) || feeAmount < 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid fee amount", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ category: editingFee.category, subcategory: editingFee.subcategory, feeAmount });
  };

  const handleAdd = () => {
    if (!newCategory.trim()) {
      toast({ title: "Category required", description: "Please select a category", variant: "destructive" });
      return;
    }
    const feeAmount = parseFloat(newFeeAmount);
    if (isNaN(feeAmount) || feeAmount < 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid fee amount", variant: "destructive" });
      return;
    }
    addMutation.mutate({ category: newCategory.trim(), subcategory: newSubcategory, feeAmount });
  };

  const handleDelete = (category: string, subcategory: string | null) => {
    const label = subcategory ? `${category} > ${subcategory}` : category;
    if (!confirm(`Delete platform fee for ${label}?`)) return;
    deleteMutation.mutate({ category, subcategory });
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategoryLabel = (subcategory: string | null) => {
    if (!subcategory) return "Default (Category-level)";
    return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
  };

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold">Platform Fees Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage platform fees by category and subcategory</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Fee
        </Button>
      </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const categoryFees = feesByCategory[category] || [];
            const isExpanded = expandedCategories.has(category);
            const hasSubcategories = (SUBCATEGORIES[category] || []).length > 0;

            return (
              <Card key={category} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {hasSubcategories && (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        )}
                        <h3 className="text-lg font-semibold">{category}</h3>
                        <span className="text-sm text-muted-foreground">
                          ({categoryFees.length} {categoryFees.length === 1 ? 'fee' : 'fees'})
                        </span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t divide-y">
                      {categoryFees.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No fees configured for this category
                        </div>
                      ) : (
                        categoryFees.map((fee, idx) => (
                          <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {fee.subcategory ? '└─' : '•'}
                                  </span>
                                  <span className="font-medium text-sm sm:text-base">
                                    {getSubcategoryLabel(fee.subcategory)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                <div className="text-left sm:text-right">
                                  <div className="font-semibold text-sm sm:text-base">£{Number(fee.fee_amount).toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">GBP</div>
                                </div>
                                <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(fee)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                                    onClick={() => handleDelete(fee.category, fee.subcategory)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                              </div>
                            </div>
          </div>
                        ))
        )}
      </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Platform Fee</DialogTitle>
            <DialogDescription>
              Update the platform fee for {editingFee?.category}
              {editingFee?.subcategory && ` > ${getSubcategoryLabel(editingFee.subcategory)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input value={editingFee?.category || ""} disabled />
            </div>
            <div>
              <Label>Subcategory</Label>
              <Input 
                value={getSubcategoryLabel(editingFee?.subcategory || null)} 
                disabled 
              />
            </div>
            <div>
              <Label>Fee Amount (GBP)</Label>
              <Input
                type="number"
                step="0.01"
                value={editingFee?.fee_amount || ""}
                onChange={(e) => setEditingFee({ ...editingFee!, fee_amount: parseFloat(e.target.value) || 0 })}
              />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Platform Fee</DialogTitle>
            <DialogDescription>Add a new platform fee for a category or subcategory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category *</Label>
              <Select value={newCategory} onValueChange={(value) => { setNewCategory(value); setNewSubcategory(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newCategory && (SUBCATEGORIES[newCategory] || []).length > 0 && (
              <div>
                <Label>Subcategory (Optional)</Label>
                <Select value={newSubcategory || ""} onValueChange={(value) => setNewSubcategory(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory or leave for category-level fee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default (Category-level)</SelectItem>
                    {(SUBCATEGORIES[newCategory] || []).map(sub => (
                      <SelectItem key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Fee Amount (GBP) *</Label>
              <Input
                type="number"
                step="0.01"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(e.target.value)}
                placeholder="3.00"
              />
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
