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
import { motion, AnimatePresence } from "framer-motion";
import { hoverScale, tapScale, springTransition } from "@/lib/animations";

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
    { path: "/my-activity", icon: Activity, label: "Activity Feed" },
    { path: "/my-stock", icon: Warehouse, label: "Inventory" },
    { path: "/reservations", icon: Package, label: "Reservations", badge: pendingReservationCount },
  ];

  return (
    <motion.header 
      className="header-glass-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
          >
            <Link to="/" className="flex items-center gap-3 text-foreground">
              <motion.img 
                src="/logo.png" 
                alt="CIGATY" 
                className="h-8 w-auto drop-shadow"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-xl font-bold tracking-wide">CIGATY</span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  transition={springTransition}
                >
                  <Link 
                    to={item.path}
                    className="relative inline-flex items-center gap-2 text-sm font-medium text-foreground px-3 py-2 rounded-lg glass-nav-item"
                  >
                    <motion.div
                      animate={{ scale: active ? 1.1 : 1 }}
                      transition={springTransition}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Badge className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                          {item.badge > 99 ? "99+" : item.badge}
                        </Badge>
                      </motion.div>
                    )}
                    {active && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        layoutId="activeNavIndicator"
                        transition={springTransition}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
            {isAdmin && (
              <motion.div
                whileHover={hoverScale}
                whileTap={tapScale}
                transition={springTransition}
              >
                <Link 
                  to="/admin" 
                  className={`relative inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg glass-nav-item ${
                    isActive("/admin") ? "text-primary" : "text-foreground"
                  }`}
                >
                  <motion.div
                    animate={{ scale: isActive("/admin") ? 1.1 : 1 }}
                    transition={springTransition}
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </motion.div>
                  <span>Admin</span>
                  {isActive("/admin") && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="adminIndicator"
                      transition={springTransition}
                    />
                  )}
                </Link>
              </motion.div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <motion.div 
            className="hidden md:block"
            animate={{ 
              width: searchFocused ? 400 : 320 
            }}
            transition={springTransition}
          >
            <div className="relative header-search">
              <motion.div
                animate={{ 
                  scale: searchFocused ? 1.1 : 1,
                  rotate: searchFocused ? 5 : 0
                }}
                transition={springTransition}
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </motion.div>
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-foreground/70 glass-input transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={hoverScale}
            whileTap={tapScale}
            transition={springTransition}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-foreground hover:bg-white/10 glass-nav-item"
              onClick={() => navigate("/cart")}
            >
              <motion.div
                animate={{ rotate: cartCount > 0 ? [0, -10, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.div>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground shadow-lg">
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
          
          <NotificationDropdown />
          
          <motion.div
            whileHover={hoverScale}
            whileTap={tapScale}
            transition={springTransition}
          >
            <Link to="/profile" aria-label="Profile">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:bg-white/10 glass-nav-item"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
