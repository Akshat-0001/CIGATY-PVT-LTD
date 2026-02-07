import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Shield,
  Megaphone,
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

const Platform = () => {
  const mainFeatures = [
    {
      icon: Package,
      title: 'Full Product Management',
      description: 'Comprehensive catalog management system with unlimited product listings, detailed specifications, and multi-currency pricing.',
      color: 'from-primary to-primary/70',
      features: [
        'Unlimited product listings',
        'Rich media support (images, videos, documents)',
        'Multi-language descriptions',
        'Automated inventory tracking',
        'Bulk import/export capabilities',
        'Product variants and SKU management',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Price Comparison & Analytics',
      description: 'Real-time market intelligence and competitive pricing analysis to make informed decisions.',
      color: 'from-secondary to-secondary/70',
      features: [
        'Real-time market data',
        'Competitive pricing insights',
        'Historical price trends',
        'Demand forecasting',
        'Custom analytics dashboards',
        'Export reports in multiple formats',
      ],
    },
    {
      icon: Shield,
      title: 'Market Restrictions & Compliance',
      description: 'Automated compliance checking and region-specific regulations management to ensure legal trading.',
      color: 'from-primary to-primary/70',
      features: [
        'Country-specific regulation database',
        'Automated compliance checking',
        'Import/export documentation',
        'Licensing verification',
        'Tax calculation automation',
        'Regulatory change alerts',
      ],
    },
    {
      icon: Megaphone,
      title: 'Brand Activation Tools',
      description: 'Powerful marketing suite to amplify your brand presence and reach target markets effectively.',
      color: 'from-secondary to-secondary/70',
      features: [
        'Featured product promotions',
        'Targeted email campaigns',
        'Banner advertising',
        'Brand storytelling pages',
        'Event promotion tools',
        'Social media integration',
      ],
    },
    {
      icon: Bell,
      title: 'Alerts & Notifications',
      description: 'Stay informed with instant updates on all critical business activities and opportunities.',
      color: 'from-primary to-primary/70',
      features: [
        'Real-time order notifications',
        'Price change alerts',
        'New opportunity matches',
        'Inventory threshold warnings',
        'Custom notification preferences',
        'Multi-channel delivery (email, SMS, push)',
      ],
    },
    {
      icon: Globe,
      title: 'Global Web Responsiveness',
      description: 'Seamless experience across all devices with optimized performance for mobile, tablet, and desktop.',
      color: 'from-secondary to-secondary/70',
      features: [
        'Mobile-first design',
        'Progressive web app (PWA)',
        'Offline functionality',
        'Fast page loading',
        'Touch-optimized interface',
        'Cross-browser compatibility',
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'Bank-level encryption and secure payment processing',
    },
    {
      icon: BarChart3,
      title: 'Advanced Reporting',
      description: 'Comprehensive business intelligence and analytics',
    },
    {
      icon: Zap,
      title: 'API Integration',
      description: 'Connect with your existing systems seamlessly',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Multi-user accounts with role-based permissions',
    },
    {
      icon: FileCheck,
      title: 'Document Management',
      description: 'Centralized storage for all business documents',
    },
    {
      icon: MessageSquare,
      title: '24/7 Support',
      description: 'Dedicated support team ready to assist you',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-24 bg-gradient-to-br from-primary/8 via-background to-primary/5 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 px-2">
              The Most <span className="text-gradient-primary">Powerful</span>
              <br />Platform for Drinks Trade
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 px-2">
              Everything you need to manage, grow, and scale your global drinks business 
              – all in one comprehensive platform.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="group text-sm md:text-base px-4 md:px-6 py-3 md:py-4 w-full sm:w-auto">
                <span className="hidden sm:inline">Register Now To Get Access To Our Platform</span>
                <span className="sm:hidden">Register Now</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Main Features */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Core <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Designed specifically for the global drinks industry
            </p>
          </div>

          <div className="space-y-24">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
                >
                  {/* Icon & Title */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground mb-6">
                      {feature.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="flex-1">
                    <div className="glass-effect rounded-2xl p-6 md:p-8 border border-primary/20">
                      <ul className="space-y-4">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm md:text-base text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Additional Features */}
      <section className="py-12 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              More <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Additional features to streamline your operations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <div
                  key={feature.title}
                  className="group relative"
                >
                  <div className="glass-effect rounded-2xl p-6 md:p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
                    {/* Icon container */}
                    <div className="relative mb-6 z-10">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-shadow duration-300">
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Ready to Experience
              <br />
              <span className="text-gradient-primary">The Platform?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12">
              Join thousands of successful drinks businesses already using CIGATY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="group w-full sm:w-auto">
                  Get Started Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
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
