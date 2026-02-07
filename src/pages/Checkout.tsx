import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentsConfig } from '@/config/payments';
import { useCreatePaymentIntent, useOrder } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getPlatformFee } from '@/lib/fees';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(orderId);
  const { mutateAsync: createIntent, data: intent } = useCreatePaymentIntent();
  const { toast } = useToast();

  useEffect(() => {
    if (!orderId) return;
    if (!paymentsConfig.enabled) return; // mock mode doesn't need PI
    (async () => {
      try { await createIntent(orderId); } catch {}
    })();
  }, [orderId]);

  // Fetch order items with listing details
  const { data: orderItems } = useQuery({
    queryKey: ['checkout_order_items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          listing:listings!inner(
            id,
            inventory_type,
            category,
            subcategory,
            product_name
          )
        `)
        .eq('order_id', orderId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId,
  });

  // Check for mixed inventory types
  const inventoryTypes = useMemo(() => {
    if (!orderItems) return [];
    const types = new Set(
      orderItems.map((item: any) => item.listing?.inventory_type).filter(Boolean)
    );
    return Array.from(types);
  }, [orderItems]);

  const hasMixedInventoryTypes = useMemo(() => {
    return inventoryTypes.length > 1;
  }, [inventoryTypes]);

  const paymentPercentage = useMemo(() => {
    if (!orderItems || orderItems.length === 0) return 100;
    // If all items are bonded warehouse, 100%, otherwise 20%
    const allBonded = orderItems.every(
      (item: any) => item.listing?.inventory_type === 'bonded_warehouse'
    );
    return allBonded ? 100 : 20;
  }, [orderItems]);

  // Guard: redirect if mixed inventory types
  useEffect(() => {
    if (hasMixedInventoryTypes && orderItems) {
      toast({ 
        title: 'Mixed Inventory Types', 
        description: 'Orders with different inventory types cannot be processed together. Please order items separately.', 
        variant: 'destructive' 
      });
      navigate('/cart');
    }
  }, [hasMixedInventoryTypes, orderItems, navigate, toast]);

  // Calculate totals with platform fees
  const { data: totals } = useQuery({
    queryKey: ['checkout_totals', orderItems],
    queryFn: async () => {
      if (!orderItems || orderItems.length === 0) return { subtotal: 0, platformFee: 0, total: 0, paymentAmount: 0 };
      
      let subtotal = 0;
      let platformFeeTotal = 0;

      for (const item of orderItems as any[]) {
        const itemTotal = Number(item.unit_price) * item.quantity;
        subtotal += itemTotal;
        
        const category = item.listing?.category || 'Spirits';
        const subcategory = item.listing?.subcategory || null;
        const fee = await getPlatformFee(category, subcategory);
        platformFeeTotal += fee * item.quantity;
      }

      const total = subtotal + platformFeeTotal; // Platform fees are ADDED to the buyer's total
      const paymentAmount = (total * paymentPercentage) / 100;
      const remainingBalance = total - paymentAmount;

      return {
        subtotal,
        platformFee: platformFeeTotal,
        total,
        paymentAmount,
        remainingBalance: paymentPercentage < 100 ? remainingBalance : 0,
      };
    },
    enabled: !!orderItems && orderItems.length > 0,
  });

  if (!orderId) {
    return (
      <div className="container py-8 px-4 space-y-4">
        <Card><CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">No order found. Please create an order from a confirmed reservation or proceed via cart flow that creates an order first.</div>
        </CardContent></Card>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
          <Button variant="outline" onClick={() => navigate('/reservations')}>Go to Reservations</Button>
        </div>
      </div>
    );
  }
  if (isLoading) return <div className="container py-8 px-4">Loading checkout…</div>;

  if (hasMixedInventoryTypes) {
    return (
      <div className="container py-8 px-4 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Orders with different inventory types cannot be processed together. Please order items separately.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      
      {/* Order Summary */}
      <Card className="glow-surface card-elevate">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Order ID</div>
          <div className="font-mono text-sm">{orderId}</div>
          
          {totals && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">€{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee:</span>
                <span className="font-medium">+€{totals.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>€{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-muted-foreground">Payment ({paymentPercentage}%):</span>
                <span className="font-semibold text-primary">€{totals.paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {totals.remainingBalance > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Remaining Balance:</span>
                  <span>€{totals.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2">
            CIGATY acts as escrow for all transactions. Payment percentage depends on inventory type.
          </div>
        </CardContent>
      </Card>

      {!paymentsConfig.enabled && (
        <div className="flex gap-2">
          <Button onClick={async () => {
            try {
              if (!orderId) return;
              // Ensure order exists before calling RPC to avoid confusing error messages
              const { data: exists, error: fetchErr } = await supabase
                .from('orders')
                .select('id, status')
                .eq('id', orderId)
                .single();
              if (fetchErr || !exists) {
                toast({ title: 'Order not found', description: 'Please create an order from cart or a confirmed reservation first.', variant: 'destructive' });
                return;
              }
              const { error } = await supabase.rpc('allocate_on_paid', { _order_id: orderId });
              if (error) {
                toast({ title: 'Payment simulation failed', description: error.message || 'Please try again.', variant: 'destructive' });
                return;
              }
              toast({ title: 'Payment simulated', description: 'Funds are now held in CIGATY Escrow.' });
              navigate(`/reservations`);
            } catch (e: any) {
              toast({ title: 'Payment simulation failed', description: e?.message || 'Please try again.', variant: 'destructive' });
            }
          }}>Simulate Payment Success</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      )}

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Stripe Payment Gateway - Coming Soon</strong>
              <br />
              Payment integration is currently under development. Please contact support for manual payment processing.
            </AlertDescription>
          </Alert>
          
          {paymentsConfig.enabled && intent?.client_secret && (
            <div className="text-xs text-muted-foreground">
              Client Secret: {intent.client_secret.substring(0, 20)}...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


