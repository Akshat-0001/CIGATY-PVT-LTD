import { NavLink, useLocation } from "react-router-dom";
import { Home, Activity, Boxes, Bookmark, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MobileBottomNav() {
  const { pathname } = useLocation();

  const { data: role } = useQuery({
    queryKey: ["my_role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      return data?.role || "user";
    },
    staleTime: 60_000,
  });

  const items = [
    { to: "/live-offers", icon: Home, label: "Marketplace" },
    { to: "/my-activity", icon: Activity, label: "Activity" },
    { to: "/my-stock", icon: Boxes, label: "Inventory" },
    { to: "/reservations", icon: Bookmark, label: "Reservations" },
  ];
  if (role === "admin") items.push({ to: "/admin", icon: Shield, label: "Admin" } as any);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
      <div className="glass-card rounded-2xl border shadow-lg backdrop-blur-md">
        <ul className="grid grid-cols-5">
          {items.map(({ to, icon: Icon, label }) => {
            const active = pathname.startsWith(to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className={`h-5 w-5 ${active ? "scale-110" : ""}`} />
                  <span className="leading-none">{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}


