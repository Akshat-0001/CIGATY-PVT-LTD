import { Target, Eye, Award, Users, Globe2, TrendingUp } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize global drinks trade by creating the most trusted, efficient B2B marketplace connecting premium brands with distributors worldwide.',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the world\'s leading platform for drinks commerce, setting new standards for transparency and excellence.',
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Integrity, innovation, excellence, and customer success drive everything we do. We build lasting partnerships based on trust.',
    },
  ];

  const stats = [
    { icon: Users, value: '5,000+', label: 'Verified Partners' },
    { icon: Globe2, value: '10+', label: 'Countries' },
    { icon: TrendingUp, value: '₹100 Cr+', label: 'Annual Trade' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">CIGATY</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              India's first B2B liquor exchange platform, transforming how premium drinks are traded globally
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              Our <span className="text-primary">Story</span>
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                CIGATY was founded with a vision to transform the traditional drinks trading industry. 
                We recognized the need for a modern, transparent, and efficient platform that could connect 
                premium brands with distributors across the globe.
              </p>
              <p>
                Today, we're proud to be India's first B2B liquor exchange, serving thousands of verified 
                partners and facilitating millions in trade volume. Our platform combines cutting-edge 
                technology with deep industry expertise to deliver unmatched value to our users.
              </p>
              <p>
                We continue to innovate and expand, always keeping our users' success at the heart of 
                everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
