import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Shield,
  Bell,
  Globe,
  BarChart3,
  Lock,
  Zap,
  Users,
  FileCheck,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Platform = () => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const handleImageLoad = (key: string) => {
    setLoadedImages(prev => ({ ...prev, [key]: true }));
  };
  
  const mainFeatures = [
    {
      icon: Package,
      title: 'Product Management',
      description: 'Comprehensive catalog with unlimited listings, multi-currency pricing, and inventory tracking.',
      features: [
        'Unlimited product listings',
        'Rich media support',
        'Multi-language descriptions',
        'Automated inventory tracking',
      ],
      mockup: '/add-listing.png',
    },
    {
      icon: TrendingUp,
      title: 'Price Analytics',
      description: 'Real-time market intelligence and competitive pricing analysis.',
      features: [
        'Real-time market data',
        'Competitive pricing insights',
        'Historical price trends',
        'Demand forecasting',
      ],
      mockup: '/inventory.png',
    },
    {
      icon: Shield,
      title: 'Compliance Management',
      description: 'Automated compliance checking and regulations management.',
      features: [
        'Country-specific regulations',
        'Automated compliance checking',
        'Import/export documentation',
        'Tax calculation automation',
      ],
      mockup: '/restrictions.png',
    },
    {
      icon: Bell,
      title: 'Alerts & Notifications',
      description: 'Stay informed with instant updates on business activities.',
      features: [
        'Real-time order notifications',
        'Price change alerts',
        'Opportunity matches',
        'Custom preferences',
      ],
      mockup: '/notifications.png',
    },
    {
      icon: Globe,
      title: 'Global Responsiveness',
      description: 'Seamless experience across all devices.',
      features: [
        'Mobile-first design',
        'Fast page loading',
        'Touch-optimized interface',
        'Cross-browser compatible',
      ],
      mockup: '/multi-device 1 main page.png',
    },
  ];

  const additionalFeatures = [
    { icon: Lock, title: 'Secure Transactions', description: 'Bank-level encryption and secure payments' },
    { icon: BarChart3, title: 'Advanced Reporting', description: 'Business intelligence and analytics' },
    { icon: Zap, title: 'API Integration', description: 'Connect with existing systems' },
    { icon: Users, title: 'Team Management', description: 'Multi-user with role permissions' },
    { icon: FileCheck, title: 'Document Management', description: 'Centralized document storage' },
    { icon: MessageSquare, title: '24/7 Support', description: 'Dedicated support team' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                The Most <span className="text-primary">Powerful</span> Platform
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Everything you need to manage, grow, and scale your global drinks business
              </p>
              <Link to="/register">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>

            {/* Right: Mockup Image */}
            <div className="relative">
              {!loadedImages['hero'] && (
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-lg animate-pulse" />
              )}
              <img 
                src="/multi-device 2 marketplace.png" 
                alt="CIGATY Platform Mockup"
                className={`w-full h-auto transition-opacity duration-300 ${loadedImages['hero'] ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                loading="eager"
                fetchPriority="high"
                onLoad={() => handleImageLoad('hero')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Core <span className="text-primary">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Designed specifically for the global drinks industry
            </p>
          </div>

          <div className="space-y-24 max-w-7xl mx-auto">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={feature.title} 
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    isEven ? '' : 'lg:grid-flow-dense'
                  }`}
                >
                  {/* Content */}
                  <div className={`${isEven ? '' : 'lg:col-start-2'}`}>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mockup Image */}
                  <div className={`${isEven ? '' : 'lg:col-start-1 lg:row-start-1'} relative`}>
                    {!loadedImages[feature.title] && (
                      <div className="w-full aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-lg animate-pulse" />
                    )}
                    <img 
                      src={feature.mockup} 
                      alt={`${feature.title} mockup`}
                      className={`w-full h-auto transition-opacity duration-300 ${loadedImages[feature.title] ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                      loading={index < 2 ? "eager" : "lazy"}
                      onLoad={() => handleImageLoad(feature.title)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              More <span className="text-primary">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Additional tools to streamline your operations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-card rounded-lg p-6 border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Experience
              <br />
              <span className="text-primary">The Platform?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join thousands of successful drinks businesses using CIGATY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Platform;
