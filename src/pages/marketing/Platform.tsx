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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
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
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Main Features */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Core <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Designed specifically for the global drinks industry
            </p>
          </motion.div>

          <div className="space-y-24">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                    isEven ? '' : 'lg:grid-flow-dense'
                  }`}
                >
                  <div className={isEven ? '' : 'lg:col-start-2'}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center sm:mr-4">
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-4 md:mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-start">
                          <CheckCircle2 className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}>
                    <div className="rounded-2xl overflow-hidden shadow-luxury border border-primary/20 bg-gradient-to-br from-card to-muted">
                      <div className="aspect-video flex items-center justify-center p-12">
                        <div className="text-center">
                          <div className={`w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl`}>
                            <Icon className="w-16 h-16 text-white" strokeWidth={2} />
                          </div>
                          <p className="text-2xl font-bold text-foreground mb-2">{feature.title}</p>
                          <p className="text-muted-foreground max-w-md mx-auto">Feature Preview</p>
                          <div className="mt-6 inline-block px-4 py-2 bg-card border border-primary/30 rounded-lg">
                            <span className="text-primary text-sm font-semibold">Coming Soon</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Additional Features Grid */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              And Much <span className="text-gradient-primary">More</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Additional features to streamline your operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const gradients = [
                'from-primary to-primary/70',
                'from-secondary to-secondary/70',
                'from-primary to-primary/70',
                'from-secondary to-secondary/70',
                'from-primary to-primary/70',
                'from-secondary to-secondary/70',
              ];
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={isMobile ? {} : { delay: index * 0.03, duration: 0.3 }}
                  whileHover={isMobile ? {} : { y: -8, scale: 1.01, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradients[index]} rounded-2xl blur opacity-0 group-hover:opacity-60 transition duration-500`} />
                  
                  <div 
                    className="relative border-2 border-primary/40 rounded-2xl p-6 md:p-8 h-full hover:border-primary/70 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
                    style={{ 
                      background: 'linear-gradient(to bottom right, hsl(153 47% 40% / 0.15), hsl(153 47% 40% / 0.22), hsl(153 47% 40% / 0.28))',
                      backgroundColor: 'hsl(153 47% 40% / 0.12)'
                    }}
                  >
                    {/* Subtle background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                    
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-25 group-hover:opacity-40 transition-opacity duration-500">
                      <Icon className="w-full h-full text-primary/50" strokeWidth={1.5} />
                    </div>
                    
                    {/* Animated gradient blob - disabled on mobile */}
                    {!isMobile && (
                      <motion.div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[index]} rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-500`}
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Icon container */}
                    <motion.div 
                      className="relative mb-6 z-10"
                      whileHover={isMobile ? {} : { scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-200`}>
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
                      </div>
                      {/* Pulsing ring - disabled on mobile */}
                      {!isMobile && (
                        <motion.div 
                          className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${gradients[index]} opacity-20 blur-xl transition-opacity duration-500`}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {feature.description}
                      </p>
                      
                      {/* Animated accent bar */}
                      <motion.div
                        className={`h-1.5 bg-gradient-to-r ${gradients[index]} rounded-full mt-6 shadow-lg`}
                        initial={{ width: isMobile ? "60%" : 0 }}
                        whileInView={isMobile ? {} : { width: "60%" }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={isMobile ? {} : { delay: index * 0.03 + 0.2, duration: 0.3 }}
                      />
                    </div>

                    {/* Corner accent - disabled on mobile */}
                    {!isMobile && (
                      <>
                        <div className="absolute bottom-0 left-0 w-24 h-24 overflow-hidden rounded-bl-2xl">
                          <motion.div
                            className={`absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br ${gradients[index]} opacity-20 group-hover:opacity-35 transition-opacity duration-500`}
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            }}
                          />
                        </div>
                        
                        {/* Top right accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                          <motion.div
                            className={`absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br ${gradients[index]} opacity-15 group-hover:opacity-25 transition-opacity duration-500`}
                            animate={{
                              rotate: [0, -360],
                            }}
                            transition={{
                              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of successful brands and distributors using CIGATY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="group">
                  Register Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Platform;

