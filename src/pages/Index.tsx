import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShoppingCart, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-primary-foreground">
              B2B Liquor Trading Platform
            </h1>
            <p className="mb-8 text-xl text-primary-foreground/90">
              Connect with verified distributors and brands. Access live inventory, real-time pricing, and secure transactions.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link to="/live-offers">
                  Browse Live Offers
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/my-stock">
                  List Your Stock
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Spiritrade?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Live Inventory</h3>
              <p className="text-muted-foreground">
                Access real-time stock levels from verified distributors across Europe. Find exactly what you need, when you need it.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Market Intelligence</h3>
              <p className="text-muted-foreground">
                Get instant price benchmarks and market insights. Know if you're getting a competitive deal with our market indicators.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure Trading</h3>
              <p className="text-muted-foreground">
                Trade with confidence. All partners are verified, transactions are secure, and compliance is built-in.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to start trading?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of distributors and brands trading on Spiritrade
            </p>
            <Button asChild size="lg">
              <Link to="/live-offers">
                Explore Live Offers
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
