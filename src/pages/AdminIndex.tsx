import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, TrendingUp, DollarSign, Warehouse, Settings, ClipboardList } from "lucide-react";

export default function AdminIndex() {
  return (
    <div className="container py-4 md:py-8 lg:py-10 px-4 space-y-4 md:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-display font-semibold">Admin Dashboard</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Content Management
          </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/admin/approvals" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
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
                <Users className="h-6 w-6 text-primary" />
            <div>
              <div className="text-xl font-medium">User Verification</div>
              <div className="text-sm text-muted-foreground">Verify new registrants, company details and KYC documents.</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" asChild><span>Open User Verification</span></Button>
          </div>
        </Link>

        <Link to="/admin/transactions" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <div className="text-xl font-medium">Transaction Management</div>
              <div className="text-sm text-muted-foreground">Monitor all reservations, view buyer and seller details, track transactions.</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" asChild><span>Open Transactions</span></Button>
          </div>
        </Link>

        <Link to="/admin/reservations" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-primary" />
            <div>
              <div className="text-xl font-medium">Reservation Management</div>
              <div className="text-sm text-muted-foreground">Approve or reject reservations, view complete buyer profiles, and manage all reservation requests.</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" asChild><span>Manage Reservations</span></Button>
          </div>
        </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Configuration
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link to="/admin/platform-fees" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-xl font-medium">Platform Fees</div>
                  <div className="text-sm text-muted-foreground">Manage category-based platform fees. Set fees for Beer, Wine, Spirits, and other categories.</div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="secondary" asChild><span>Manage Platform Fees</span></Button>
              </div>
            </Link>

            <Link to="/admin/bonded-warehouses" className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Warehouse className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-xl font-medium">Bonded Warehouses</div>
                  <div className="text-sm text-muted-foreground">Manage bonded warehouse locations. Add, edit, or deactivate warehouses for inventory management.</div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="secondary" asChild><span>Manage Warehouses</span></Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


