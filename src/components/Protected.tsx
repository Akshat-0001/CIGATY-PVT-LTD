import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Protected route component - to be rebuilt with new auth flow
export function Protected({ children }: { children: JSX.Element }) {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        // For now, just check if user is logged in
        // Will be enhanced with new auth flow
        setAllowed(true);
        setLoading(false);
      } catch (err: any) {
        console.error("Protected route error:", err);
        setAllowed(false);
        setLoading(false);
      }
    })();
  }, []);

  if (loading || allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!allowed) {
    // Redirect to home for now - will be updated with new auth flow
    return <Navigate to="/" replace />;
  }

  return children;
}
