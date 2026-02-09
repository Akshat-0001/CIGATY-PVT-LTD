import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
  Trophy,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const features = [
    {
      icon: Trophy,
      title: "India's First B2B Liquor Exchange",
      description: "Pioneering digital transformation of global drinks trade with 5,000+ verified partners.",
    },
    {
      icon: Shield,
      title: "Secure Escrow System",
      description: "Bank-level security with automated escrow payments. 100% payment protection guaranteed.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Intelligence",
      description: "Access live pricing data, competitive analysis, and demand forecasting.",
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description: "Automated compliance checking and region-specific regulations management.",
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with verified distributors and premium brands worldwide.",
    },
    {
      icon: CheckCircle2,
      title: "24/7 Support",
      description: "Dedicated support team ready to assist with trading and logistics.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Centered Content */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6 border border-primary/20">
                <span className="text-primary font-semibold text-sm">
                  INDIA'S FIRST B2B LIQUOR EXCHANGE
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Trade Premium Drinks
                <br />
                <span className="text-primary">Globally</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect premium spirits and wine brands with distributors worldwide. 
                Your trusted B2B platform for seamless global trade.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/platform">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Video Placeholder Below */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border-2 border-primary/20 flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-primary border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-muted-foreground font-medium">Video Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">CIGATY</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The only platform built specifically for global drinks trade
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Mockup Image */}
            <div className="relative lg:pr-8">
              <img 
                src="/main-page-mock-photo.png" 
                alt="CIGATY Platform Interface"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>

            {/* Right: Features List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-primary font-bold text-lg flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/platform">
              <Button variant="outline" size="lg">
                See All Features
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your
              <br />
              <span className="text-primary">Drinks Business?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join the global marketplace that's changing the way premium drinks are traded
            </p>
            <Link to="/register">
              <Button size="lg">
                Start Your Journey
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
