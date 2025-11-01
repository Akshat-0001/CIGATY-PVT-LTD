import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const mockDeals = [
  {
    id: "1",
    type: "buy",
    product: "J.M Rhum Vieux Agricole Millesime 2013 43.8° 70 cl + GBX",
    packaging: "6x70cl",
    category: "Spirits",
    subcategory: "Rum",
    warehouse: "Loendersloot",
    updateDate: "26.10.2025",
    quantity: 1,
    totalPrice: 342.40,
    status: "Reserved",
  },
  {
    id: "2",
    type: "sell",
    product: "Jameson",
    packaging: "6x70cl",
    category: "Spirits",
    subcategory: "Whisky",
    warehouse: "Loendersloot",
    updateDate: "11.09.2023",
    quantity: 5000,
    totalPrice: 297650.00,
    status: "Active",
  },
  {
    id: "3",
    type: "buy",
    product: "Mis Amigos Strawberry Cream Tequila",
    packaging: "6x70cl",
    category: "Spirits",
    subcategory: "Tequila",
    warehouse: "Amsterdam Warehouse Company",
    updateDate: "18.08.2023",
    quantity: 1400,
    totalPrice: 64260.00,
    status: "Declined",
  },
];

export default function MyActivity() {
  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Activity</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Deals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">2 items</p>
            
            <div className="flex items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search for product, category, subcategory" className="pl-10" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Sort by</span>
                <Button variant="outline" size="sm">Date</Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Filter by</span>
                <Button variant="outline" size="sm">All</Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
              <div>Activity</div>
              <div>Product</div>
              <div>Category</div>
              <div>Sub Category</div>
              <div>Warehouse</div>
              <div>Update Date</div>
              <div>Quantity</div>
              <div>Total Price</div>
              <div>Status</div>
            </div>
            
            {mockDeals.map((deal) => (
              <div key={deal.id} className="grid grid-cols-[auto,2fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <Badge variant={deal.type === "buy" ? "default" : "destructive"}>
                    {deal.type === "buy" ? "Buy" : "Sell"}
                  </Badge>
                </div>
                
                <div className="flex flex-col justify-center">
                  <p className="font-medium text-sm text-primary">{deal.product}</p>
                  <p className="text-xs text-muted-foreground">{deal.packaging}</p>
                </div>
                
                <div className="flex items-center text-sm">{deal.category}</div>
                <div className="flex items-center text-sm">{deal.subcategory}</div>
                <div className="flex items-center text-sm">{deal.warehouse}</div>
                <div className="flex items-center text-sm">{deal.updateDate}</div>
                <div className="flex items-center text-sm">{deal.quantity}</div>
                
                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-sm">€{deal.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total: €{deal.totalPrice.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center">
                  <Badge 
                    variant={
                      deal.status === "Reserved" ? "default" : 
                      deal.status === "Declined" ? "destructive" : 
                      "secondary"
                    }
                  >
                    {deal.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            No historical deals yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
