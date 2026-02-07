import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
  Trophy,
  Shield,
  TrendingUp,
  FileCheck,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type for benefit card
type BenefitCardType = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  stat: string | null;
  statLabel: string | null;
  highlight: string | null;
  gradient: string;
};

// Benefit card component
const BenefitCard = ({ card }: { card: BenefitCardType }) => {
  const Icon = card.icon;
  
  return (
    <div className="group relative">
      <div 
        className="relative border-2 border-primary/30 rounded-2xl p-4 md:p-6 lg:p-8 h-full hover:border-primary/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
        style={{ 
          background: 'linear-gradient(to bottom right, hsl(153 47% 40% / 0.08), hsl(153 47% 40% / 0.12), hsl(153 47% 40% / 0.15))',
          backgroundColor: 'hsl(153 47% 40% / 0.06)'
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Icon Container */}
        <div className="relative mb-6 z-10">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300`}>
            <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300">
            {card.title}
          </h3>
          
          {card.stat && (
            <div className="mb-3 md:mb-4">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {card.stat}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">
                {card.statLabel}
              </div>
            </div>
          )}
          
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 md:mb-4 group-hover:text-foreground transition-colors">
            {card.description}
          </p>
          
          {card.highlight && (
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg mt-4">
              <span className="text-primary text-sm font-semibold">
                {card.highlight}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const stats = [
    { label: 'Verified Liquor Partners', value: '5,000+' },
    { label: 'Global & Indian Brands', value: '600+' },
    { label: 'Export Regions', value: '10+' },
    { label: 'in Annual Liquor Trade', value: '₹100 Cr+' },
  ];

  const whyChooseCards: BenefitCardType[] = [
    {
      icon: Trophy,
      title: "India's First B2B Liquor Exchange",
      description: "Pioneering the digital transformation of global drinks trade",
      stat: "5,000+",
      statLabel: "Verified Partners",
      highlight: null,
      gradient: 'from-primary to-primary/70',
    },
    {
      icon: Shield,
      title: "Secure Escrow System",
      description: "Bank-level security with automated escrow payments. Your funds are protected until delivery confirmation.",
      stat: null,
      statLabel: null,
      highlight: "100% Payment Protection",
      gradient: 'from-primary to-primary/70',
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Intelligence",
      description: "Access live pricing data, competitive analysis, and demand forecasting across global markets.",
      stat: null,
      statLabel: null,
      highlight: "Price Comparison & Analytics",
      gradient: 'from-secondary to-secondary/70',
    },
    {
      icon: FileCheck,
      title: "Automated Compliance",
      description: "Never worry about regulations. Our system automatically checks market restrictions and compliance requirements.",
      stat: null,
      statLabel: null,
      highlight: "Market Restrictions Management",
      gradient: 'from-primary to-primary/70',
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with verified distributors and premium brands worldwide",
      stat: "600+",
      statLabel: "Global Brands",
      highlight: null,
      gradient: 'from-secondary to-secondary/70',
    },
    {
      icon: MessageSquare,
      title: "24/7 Expert Support",
      description: "Dedicated support team ready to assist with trading, logistics, and compliance questions.",
      stat: null,
      statLabel: null,
      highlight: "Always Available",
      gradient: 'from-primary to-primary/70',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 pt-28 md:pt-32 pb-12 md:pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center glass-effect rounded-full px-3 md:px-6 py-2 md:py-3 mb-6 md:mb-8 border border-primary/30">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2" />
              <span className="text-primary font-semibold text-xs md:text-sm tracking-wide">
                WELCOME TO THE FUTURE OF B2B DRINKS TRADING
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-foreground mb-6 md:mb-8 leading-tight px-2">
              India's First{' '}
              <span className="text-gradient-primary inline-block">
                B2B Liquor Exchange
              </span>
              <br />
              Platform
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Connect premium spirits and wine brands with distributors worldwide. 
              Your trusted B2B platform for seamless global trade.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="group text-base md:text-lg px-6 md:px-10 py-4 md:py-5 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto">
                  Get Started Today
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" size={20} />
                </Button>
              </Link>
              <Link to="/platform">
                <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-10 py-4 md:py-5 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto">
                  Explore Platform
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto px-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-effect rounded-xl p-4 md:p-6 border border-primary/20 hover:border-primary/50 transition-all duration-200"
                >
                  <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-gradient-primary mb-1 md:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-muted-foreground font-medium leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Why Choose CIGATY Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-16">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 inline-block">
              Why Choose CIGATY
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Why Industry Leaders
              <br />
              <span className="text-gradient-primary">Choose CIGATY</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The only platform built specifically for global drinks trade. 
              Join thousands of successful brands and distributors worldwide.
            </p>
          </div>

          {/* 3-Column Grid of Benefit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto px-4">
            {whyChooseCards.map((card) => (
              <BenefitCard key={card.title} card={card} />
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-8 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { text: "Bank-Level Security", icon: Shield },
              { text: "Verified Partners", icon: CheckCircle2 },
              { text: "Global Reach", icon: Globe },
            ].map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 px-6 py-3 bg-card border border-primary/20 rounded-full hover:border-primary/40 transition-all duration-300"
                >
                  <BadgeIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{badge.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-8 md:mt-12 text-center">
            <Link to="/platform">
              <Button variant="outline" size="lg" className="group">
                See How It Works
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-tight px-2">
              Ready to Transform Your
              <br />
              <span className="text-gradient-primary">Drinks Business?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 leading-relaxed px-2">
              Join the global marketplace that's changing the way premium drinks are traded worldwide.
            </p>

            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base md:text-xl px-8 md:px-16 py-4 md:py-6 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto">
                Start Your Journey Now
                <ArrowRight className="ml-2 md:ml-3" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
