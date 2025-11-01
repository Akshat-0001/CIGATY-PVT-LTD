import { useEffect, useState } from "react";
import { Search, ShoppingCart, Bell, User, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        try {
          const { data, error } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (!error && ((data?.role as string) || "") === "admin") {
            setIsAdmin(true);
            return;
          }
        } catch {}
        // Fallback: use is_admin RPC (SECURITY DEFINER)
        const { data: isAdminRpc } = await (supabase as any).rpc('is_admin', { user_id: session.user.id });
        setIsAdmin(!!isAdminRpc);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 text-foreground">
            <img src="/logo.png" alt="CIGATY" className="h-8 w-auto drop-shadow" />
            <span className="text-xl font-bold tracking-wide">CIGATY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/live-offers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Live Offers
            </Link>
            <Link to="/my-activity" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              My Activity
            </Link>
            <Link to="/my-stock" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              My Stock
            </Link>
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-muted border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-success text-success-foreground">
              0
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-success text-success-foreground">
              3
            </Badge>
          </Button>
          
          <Link to="/profile" aria-label="Profile">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
