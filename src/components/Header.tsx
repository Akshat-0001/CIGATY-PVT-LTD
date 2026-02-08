import { useEffect, useState } from "react";
import { Search, ShoppingCart, User, ShieldCheck, Package, Store, Activity, Warehouse } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { usePendingReservationCount } from "@/hooks/useReservations";
import { NotificationDropdown } from "./notifications/NotificationDropdown";
import { motion } from "framer-motion";
import { springTransition } from "@/lib/animations";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { cartCount } = useCart();
  const { data: buyerPendingCount = 0 } = usePendingReservationCount(false);
  const { data: sellerPendingCount = 0 } = usePendingReservationCount(true);
  
  const pendingReservationCount = isSeller ? sellerPendingCount : buyerPendingCount;

  const isActive = (path: string) => location.pathname === path;

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
          }
          // Check if user has listings (is a seller)
          const { count } = await (supabase as any)
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("seller_user_id", session.user.id);
          setIsSeller((count || 0) > 0);
        } catch {}
        // Fallback: use is_admin RPC (SECURITY DEFINER)
        if (!isAdmin) {
          const { data: isAdminRpc } = await (supabase as any).rpc('is_admin', { user_id: session.user.id });
          setIsAdmin(!!isAdminRpc);
        }
      } catch {
        setIsAdmin(false);
        setIsSeller(false);
      }
    })();
  }, []);

  const navItems = [
    { path: "/live-offers", icon: Store, label: "Marketplace" },
    { path: "/my-activity", icon: Activity, label: "Activity" },
    { path: "/my-stock", icon: Warehouse, label: "Inventory" },
    { path: "/reservations", icon: Package, label: "Reservations", badge: pendingReservationCount },
  ];

  return (
    <header className="header-glass-dark">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
            <img 
              src="/logo.png" 
              alt="CIGATY" 
              className="h-8 w-auto drop-shadow"
            />
            <span className="text-xl font-bold tracking-wide">CIGATY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 mr-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className="relative inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  )}
                  {active && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="activeNavIndicator"
                      transition={springTransition}
                    />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`relative inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-foreground"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
                {isActive("/admin") && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="adminIndicator"
                    transition={springTransition}
                  />
                )}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block w-80">
            <div className="relative header-search">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-foreground/70 glass-input transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-foreground hover:text-primary transition-colors"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground shadow-lg">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Button>
          
          <NotificationDropdown />
          
          <Link to="/profile" aria-label="Profile">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
