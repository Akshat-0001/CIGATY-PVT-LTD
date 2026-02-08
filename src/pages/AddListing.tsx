import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['Beer','Wine','Spirits','Champagne','Soft Drinks','Other'];
const SUBCATEGORIES: Record<string, string[]> = {
  Beer: ['craft','low/no alcohol'],
  Wine: ['port','sparkling wine','fortified','mixed'],
  Spirits: ['Gin','liqueur','pastis','whiskey','mezcal','rum','vodka','cognac/brandy','tequila','armagnac','other'],
  Champagne: ['Vintage','Non-Vintage','Rose','other'],
  Other: ['Absinthe','Calvados','Non Alcoholic','Grappa','Raki','Sake','Mixed cocktails','other'],
  'Soft Drinks': [],
};
const volumes = ['2 cl','3 cl','4 cl','5 cl','10 cl','20 cl','35 cl','50 cl','70 cl','75 cl','100 cl'];
const incoterms = ['EXW (Ex Works)','DAP (Delivered at Place)','CIF (Cost, Insurance, Freight)','FOB (Free On Board)'];
const leadTimes = ['On the floor','1 week','2 weeks','3 weeks','4 weeks','5 weeks','6 weeks','7 weeks','8 weeks'];

export default function AddListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const [userId, setUserId] = useState<string>('');

  // step state
  const [packaging, setPackaging] = useState<'bottle'|'case'>('bottle');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [minQty, setMinQty] = useState<number>(1);
  const [content, setContent] = useState('');
  const [condition, setCondition] = useState('Good');
  const [customStatus, setCustomStatus] = useState('T2');
  const [inventoryType, setInventoryType] = useState<'bonded_warehouse' | 'through_brand' | 'other'>('bonded_warehouse');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [customWarehouseName, setCustomWarehouseName] = useState<string>('');
  const [incoterm, setIncoterm] = useState(incoterms[0]);
  const [leadTime, setLeadTime] = useState(leadTimes[1]);

  const [bottlesPerCase, setBottlesPerCase] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  // Platform fees are calculated at checkout, not during listing creation

  const [abv, setAbv] = useState<number | ''>('');
  const [refillable, setRefillable] = useState<'yes'|'no'>('yes');
  const [expiry, setExpiry] = useState<string>('');

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // restrictions modal
  const [restrictionsOpen, setRestrictionsOpen] = useState(false);
  const [restrictionType, setRestrictionType] = useState<'include'|'exclude'>('exclude');
  const [countries, setCountries] = useState<string[]>([]);

  const [warehouses, setWarehouses] = useState<{id:string;name:string}[]>([]);
  const [bondedWarehouses, setBondedWarehouses] = useState<{id:string;name:string}[]>([]);

  const [currency, setCurrency] = useState('EUR');
  const [duty, setDuty] = useState<'duty_paid' | 'under_bond'>('duty_paid');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUserId(user.id);
      const { data } = await supabase.from('warehouses').select('id,name').order('name');
      setWarehouses((data as any[]) || []);
      const { data: bondedData } = await supabase.from('bonded_warehouses').select('id,name').eq('is_active', true).order('name');
      setBondedWarehouses((bondedData as any[]) || []);
      // Prefill for edit mode
      if (editId) {
        const { data: listing } = await (supabase as any)
          .from('listings')
          .select('*')
          .eq('id', editId)
          .single();
        if (listing) {
          setProductName(listing.product_name || '');
          setCategory(listing.category || '');
          setSubcategory(listing.subcategory || '');
          setPackaging(listing.packaging || 'bottle');
          setQuantity(listing.quantity || 0);
          setMinQty(listing.min_quantity || 1);
          setContent(listing.content || '');
          setBottlesPerCase(listing.bottles_per_case || 0);
          setPrice(Number(listing.price || listing.price_per_case || 0));
          setAbv(listing.abv || '');
          setRefillable(listing.refillable ? 'yes' : 'no');
          setExpiry(listing.expiry_date || '');
          setCondition(listing.condition || 'Good');
          setCustomStatus(listing.custom_status || 'T2');
          setInventoryType(listing.inventory_type || 'bonded_warehouse');
          setWarehouseId(listing.warehouse_id || '');
          setCustomWarehouseName(listing.custom_warehouse_name || '');
          setIncoterm(listing.incoterm || incoterms[0]);
          setLeadTime(listing.lead_time || leadTimes[1]);
          if (Array.isArray(listing.image_urls)) setImagePreviews(listing.image_urls);
          setDuty(listing.duty || duty);
          setCurrency(listing.currency || currency);
        }
      }
    })();
  }, [navigate, editId]);

  const onImages = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    if (images.length + arr.length > 3) {
      toast.error('Max 3 images allowed');
      return;
    }
    const tooBig = arr.find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) { toast.error('Max size 5MB per image'); return; }
    const merged = [...images, ...arr];
    setImages(merged);
    setImagePreviews(merged.map(f => URL.createObjectURL(f)));
  };

  const clearImages = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImages([]); setImagePreviews([]);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    const urls: string[] = [];
    for (const file of images) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product_images').upload(path, file, { upsert: false, cacheControl: '3600' });
      if (error) throw error;
      const { data } = supabase.storage.from('product_images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const validateCore = () => {
    if (!productName.trim()) return 'Product name is required';
    if (!category) return 'Category is required';
    if (quantity <= 0) return 'Quantity must be greater than zero';
    if (packaging === 'case' && bottlesPerCase <= 0) return 'Bottles per case must be set';
    if (price <= 0) return 'Price must be greater than zero';
    if (inventoryType === 'bonded_warehouse' && !warehouseId) return 'Bonded warehouse is required';
    if (inventoryType === 'other' && !customWarehouseName.trim()) return 'Custom warehouse name is required';
    return '';
  };

  const saveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data, error } = await supabase.rpc('insert_listing_full', {
        _product_name: productName,
        _category: category,
        _subcategory: subcategory,
        _packaging: packaging,
        _quantity: quantity,
        _min_quantity: 1,
        _content: content,
        _bottles_per_case: packaging === 'case' ? bottlesPerCase : null,
        _price: price,
        _final_price: price, // Platform fees calculated at checkout, not here
        _abv: null,
        _refillable: true,
        _expiry_date: null,
        _condition: 'Good',
        _custom_status: 'T2',
        _warehouse_id: warehouseId || null,
        _incoterm: 'EXW (Ex Works)',
        _lead_time: '1 week',
        _ui_status: 'draft',
        _status: 'pending',
        _image_urls: [],
        _currency: currency,
        _duty: duty,
        _restriction_type: null,
        _countries: null,
      });
      if (error) throw error;
      toast.success('Draft saved');
    } catch (e: any) { toast.error(e.message || 'Failed to save draft'); }
  };

  const submit = async (addAnother = false) => {
    const msg = validateCore();
    if (msg) { toast.error(msg); return; }
    try {
      const imgs = await uploadImages();
      if (isEdit && editId) {
        const { error: upErr } = await (supabase as any)
          .from('listings')
          .update({
            product_name: productName,
            category, subcategory, packaging,
            quantity: quantity, min_quantity: minQty,
            content,
            bottles_per_case: packaging === 'case' ? bottlesPerCase : null,
            price, final_price: price, // Platform fees calculated at checkout
            abv: abv === '' ? null : Number(abv),
            refillable: refillable === 'yes',
            expiry_date: expiry || null,
            condition: condition,
            custom_status: customStatus,
            inventory_type: inventoryType,
            warehouse_id: inventoryType === 'bonded_warehouse' ? warehouseId || null : null,
            custom_warehouse_name: inventoryType === 'other' ? customWarehouseName : null,
            incoterm, lead_time: leadTime,
            image_urls: imagePreviews.concat([]),
            currency, duty,
          })
          .eq('id', editId);
        if (upErr) throw upErr;
        toast.success('Listing updated');
        navigate('/my-stock');
        return;
      }
      const { data, error } = await supabase.rpc('insert_listing_full', {
        _product_name: productName,
        _category: category,
        _subcategory: subcategory,
        _packaging: packaging,
        _quantity: quantity,
        _min_quantity: minQty,
        _content: content,
        _bottles_per_case: packaging === 'case' ? bottlesPerCase : null,
        _price: price,
        _final_price: price, // Platform fees calculated at checkout, not here
        _abv: abv === '' ? null : Number(abv),
        _refillable: refillable === 'yes',
        _expiry_date: expiry || null,
        _condition: condition,
        _custom_status: customStatus,
        _inventory_type: inventoryType,
        _warehouse_id: inventoryType === 'bonded_warehouse' ? warehouseId || null : null,
        _custom_warehouse_name: inventoryType === 'other' ? customWarehouseName : null,
        _incoterm: incoterm,
        _lead_time: leadTime,
        _ui_status: 'draft',
        _status: 'pending',
        _image_urls: imgs,
        _currency: currency,
        _duty: duty,
        _restriction_type: countries.length ? restrictionType : null,
        _countries: countries.length ? countries : null,
      });
      if (error) throw error;

      toast.success('Saved as draft. You can Make Live from My Stock.');
      if (addAnother) {
        setProductName(''); setCategory(''); setSubcategory(''); setPackaging('bottle'); setQuantity(0); setMinQty(1); setContent(''); setCondition('Good'); setCustomStatus('T2'); setInventoryType('bonded_warehouse'); setWarehouseId(''); setCustomWarehouseName(''); setIncoterm(incoterms[0]); setLeadTime(leadTimes[1]); setBottlesPerCase(0); setPrice(0); setAbv(''); setRefillable('yes'); setExpiry(''); clearImages(); setCountries([]);
        return;
      }
      navigate('/my-stock');
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit');
    }
  };

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">{isEdit ? 'Edit Listing' : 'Add Listing'}</h1>
        <p className="text-muted-foreground">General Product Information</p>
        <div className="text-xs text-muted-foreground">Please fill in all the required fields to publish your product to live offers. For saving a draft, only product name is mandatory.</div>
      </div>

      {/* Product Basics */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <Input label="Product Name" value={productName} onChange={(e) => setProductName(e.target.value.slice(0,100))} required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Product Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Sub-category</Label>
            <Select value={subcategory} onValueChange={setSubcategory} disabled={!category || (SUBCATEGORIES[category]||[]).length===0}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder={category ? "Select sub-category" : "Choose category first"} /></SelectTrigger>
              <SelectContent>
                {(SUBCATEGORIES[category] || []).map(sc => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Packaging</Label>
            <div className="inline-flex w-full rounded-md border border-border overflow-hidden">
              <button type="button" className={`flex-1 px-4 py-3 md:py-2 text-sm font-medium transition-colors ${packaging==='case'?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`} onClick={() => setPackaging('case')}>Cases</button>
              <button type="button" className={`flex-1 px-4 py-3 md:py-2 text-sm font-medium transition-colors ${packaging==='bottle'?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`} onClick={() => setPackaging('bottle')}>Bottles</button>
            </div>
          </div>
          <Input label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          <Input label="Minimum Quantity (Optional)" type="number" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Content (Volume)</Label>
            <Select value={content} onValueChange={setContent}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder="Select content" /></SelectTrigger>
              <SelectContent>
                {volumes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tax Status</Label>
            <Select value={duty} onValueChange={(v) => setDuty(v as any)}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder="Select tax status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="duty_paid">Duty Paid</SelectItem>
                <SelectItem value="under_bond">Under Bond</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Inventory Location *</Label>
            <Select value={inventoryType} onValueChange={(v) => { setInventoryType(v as any); setWarehouseId(''); setCustomWarehouseName(''); }}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder="Select Inventory Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bonded_warehouse">Bonded Warehouse</SelectItem>
                <SelectItem value="through_brand">Through Brand</SelectItem>
                <SelectItem value="other">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {inventoryType === 'bonded_warehouse' && (
            <div className="grid gap-2">
              <Label>Bonded Warehouse *</Label>
              {bondedWarehouses.length > 0 ? (
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="h-12 md:h-10"><SelectValue placeholder="Select Bonded Warehouse" /></SelectTrigger>
                <SelectContent>
                    {bondedWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
              ) : (
                <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                  No bonded warehouses available. Please add warehouses in Admin Panel first.
                </div>
              )}
            </div>
          )}
          {inventoryType === 'other' && (
            <div className="grid gap-2">
              <Label>Custom Warehouse Name *</Label>
              <Input
                value={customWarehouseName}
                onChange={(e) => setCustomWarehouseName(e.target.value)}
                placeholder="Enter warehouse name"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Incoterms</Label>
            <Select value={incoterm} onValueChange={setIncoterm}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {incoterms.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Lead Time</Label>
            <Select value={leadTime} onValueChange={setLeadTime}>
              <SelectTrigger className="h-12 md:h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {leadTimes.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border bg-card p-4 md:p-6 space-y-4">
        {packaging === 'bottle' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Price per Bottle (€)" type="number" min={0} step="0.01" value={price} onChange={(e)=>setPrice(Number(e.target.value))} required />
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                Platform fees (category-based) will be deducted at checkout. The price you enter here is what buyers will see.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Bottles per Case" type="number" min={1} value={bottlesPerCase} onChange={(e)=>setBottlesPerCase(Number(e.target.value))} required />
            <Input label="Price per Case (€)" type="number" min={0} step="0.01" value={price} onChange={(e)=>setPrice(Number(e.target.value))} required />
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                Platform fees (category-based) will be deducted at checkout. The price you enter here is what buyers will see.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="rounded-2xl border bg-card p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="ABV % (Optional)" type="number" value={abv} onChange={(e)=>setAbv(e.target.value===''? '': Number(e.target.value))} />
        <div className="grid gap-2">
          <Label>Refillable</Label>
          <div className="inline-flex w-full rounded-md border border-border overflow-hidden">
            <button type="button" className={`flex-1 px-4 py-3 md:py-2 text-sm font-medium transition-colors ${refillable==='yes'?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`} onClick={()=>setRefillable('yes')}>Yes</button>
            <button type="button" className={`flex-1 px-4 py-3 md:py-2 text-sm font-medium transition-colors ${refillable==='no'?'bg-primary text-primary-foreground':'bg-muted text-foreground hover:bg-muted/80'}`} onClick={()=>setRefillable('no')}>No</button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Expiry Date (Optional)</Label>
          <input type="date" className="h-12 md:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={expiry} onChange={(e)=>setExpiry(e.target.value)} />
        </div>
      </div>

      {/* Product Images */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="text-sm text-muted-foreground">Up to 3 images allowed. Supported file types: JPEG, PNG. File size - up to 5MB.</div>
        <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-all">
          <input type="file" accept="image/*" multiple hidden onChange={(e)=>onImages(e.target.files)} />
          <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-foreground">Add Product Images (optional)</div>
        </label>
        {imagePreviews.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative w-28 h-28 border rounded-md overflow-hidden">
                <img src={src} alt="preview" className="object-cover w-full h-full" />
                <button className="absolute top-1 right-1 bg-background/80 rounded-full p-1 border border-border" onClick={() => { const next = [...images]; next.splice(idx,1); setImages(next); const p=[...imagePreviews]; URL.revokeObjectURL(p[idx]); p.splice(idx,1); setImagePreviews(p); }}>
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restricted Markets */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <div className="text-sm text-muted-foreground">If no restrictions applied, your product will be sold worldwide. If exclude is applied, your product will not be sold in selected countries. If include is applied, your product will only be sold in selected countries.</div>
        <Button 
          variant="outline" 
          onClick={()=>setRestrictionsOpen(true)}
          size="md"
        >
          + Apply Market Restrictions
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={saveDraft}
          size="md"
          className="sm:flex-none"
        >
          Save as Draft
        </Button>
        <div className="flex-1 hidden sm:block" />
        <Button 
          variant="secondary" 
          onClick={()=>submit(false)}
          size="md"
          className="sm:flex-none"
        >
          Submit
        </Button>
        <Button 
          variant="primary"
          onClick={()=>submit(true)}
          size="md"
          className="sm:flex-none"
        >
          Submit & Add Another
        </Button>
        <Button 
          variant="ghost" 
          onClick={()=>navigate('/my-stock')}
          size="md"
          className="sm:flex-none"
        >
          Cancel
        </Button>
      </div>

      {/* Restrictions modal */}
      <Dialog open={restrictionsOpen} onOpenChange={setRestrictionsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Market Restrictions</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="inline-flex rounded-md border border-border overflow-hidden w-max">
              <button className={`px-4 py-2 ${restrictionType==='exclude'?'bg-primary text-primary-foreground':'bg-muted text-foreground'}`} onClick={()=>setRestrictionType('exclude')}>Exclude</button>
              <button className={`px-4 py-2 ${restrictionType==='include'?'bg-primary text-primary-foreground':'bg-muted text-foreground'}`} onClick={()=>setRestrictionType('include')}>Include</button>
            </div>
            <Textarea placeholder="Enter country names separated by commas (e.g., India, France, Germany)" value={countries.join(', ')} onChange={(e)=>setCountries(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setRestrictionsOpen(false)} size="md">Cancel</Button>
            <Button variant="secondary" onClick={()=>setRestrictionsOpen(false)} size="md">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
