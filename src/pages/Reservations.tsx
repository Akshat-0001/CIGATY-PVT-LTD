import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuyerReservationsView from "@/components/reservations/BuyerReservationsView";
import SellerReservationsView from "@/components/reservations/SellerReservationsView";
import { useSearchParams } from "react-router-dom";

async function checkIfSeller() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_user_id", user.id);
  
  return (count || 0) > 0;
}

export default function Reservations() {
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const lastTabKey = "reservations_last_tab";
  const urlTab = searchParams.get("tab");

  useEffect(() => {
    (async () => {
      const seller = await checkIfSeller();
      setIsSeller(seller);
      setLoading(false);
    })();
  }, []);

  const defaultTab = useMemo(() => {
    if (urlTab === "selling" || urlTab === "buying") return urlTab;
    const saved = typeof window !== "undefined" ? localStorage.getItem(lastTabKey) : null;
    if (saved === "selling" || saved === "buying") return saved;
    return isSeller ? "selling" : "buying";
  }, [urlTab, isSeller]);

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    }, { replace: true });
    try { localStorage.setItem(lastTabKey, value); } catch {}
  };

  if (loading) {
    return (
      <div className="container py-4 md:py-8 px-4">
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 px-4">
      <Tabs value={defaultTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="buying">Buying</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
        </TabsList>

        <TabsContent value="buying">
          <BuyerReservationsView />
        </TabsContent>
        <TabsContent value="selling">
          <SellerReservationsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

