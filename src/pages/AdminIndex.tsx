import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users } from "lucide-react";

export default function AdminIndex() {
  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-semibold">Admin</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/admin/approvals" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />
            <div>
              <div className="text-xl font-medium">Listings Approvals</div>
              <div className="text-sm text-muted-foreground">Review, approve or reject product listings awaiting moderation.</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" asChild><span>Open Listings Approvals</span></Button>
          </div>
        </Link>

        <Link to="/admin/users" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <div>
              <div className="text-xl font-medium">User Verification</div>
              <div className="text-sm text-muted-foreground">Verify new registrants, company details and KYC documents.</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" asChild><span>Open User Verification</span></Button>
          </div>
        </Link>
      </div>
    </div>
  );
}


