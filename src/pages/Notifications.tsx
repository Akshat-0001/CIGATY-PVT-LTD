import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function fetchNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data || []) as any[];
}

export default function Notifications() {
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: fetchNotifications });

  return (
    <div className="container py-4 md:py-8 px-4 space-y-4">
      <h1 className="text-xl sm:text-2xl font-display font-semibold">Notifications</h1>
      {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {!isLoading && (data || []).length === 0 && (
        <div className="text-sm text-muted-foreground">You're all caught up.</div>
      )}
      <div className="space-y-3">
        {(data || []).map((n: any) => (
          <Card key={n.id} className="glass-card">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{n.title || n.type}</CardTitle>
                <Badge variant="outline" className="text-xs">{new Date(n.created_at).toLocaleString()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
              {n.message || ""}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


