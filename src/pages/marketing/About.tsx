import { motion } from 'framer-motion';
import { Target, Eye, Award, Users, Globe2, TrendingUp } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To revolutionize the global drinks trade by creating the most trusted, efficient, and innovative B2B marketplace that connects premium brands with distributors worldwide.',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the world\'s leading platform for drinks commerce, setting new standards for transparency, accessibility, and excellence in the industry.',
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Integrity, innovation, excellence, and customer success drive everything we do. We believe in building lasting partnerships based on trust and mutual growth.',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Foundation', description: 'Company milestone and key achievements' },
    { year: '2021', title: 'Global Expansion', description: 'Strategic growth and market development' },
    { year: '2022', title: 'Platform 2.0', description: 'Technology advancement and feature enhancement' },
    { year: '2023', title: 'Market Leader', description: 'Industry recognition and business growth' },
    { year: '2024', title: 'Innovation Hub', description: 'Continued innovation and platform evolution' },
  ];

  const team = [
    {
      role: 'CEO & Founder',
      initials: 'CF',
      bio: 'Visionary leader with expertise in liquor industry',
      gradient: 'from-primary to-primary/70',
    },
    {
      role: 'CTO',
      initials: 'CT',
      bio: 'Technology expert driving platform innovation',
      gradient: 'from-secondary to-secondary/70',
    },
    {
      role: 'Head of Operations',
      initials: 'HO',
      bio: 'Operations specialist ensuring seamless execution',
      gradient: 'from-primary to-primary/70',
    },
    {
      role: 'Chief Business Officer',
      initials: 'CB',
      bio: 'Business strategist driving growth and expansion',
      gradient: 'from-secondary to-secondary/70',
    },
  ];

  const achievements = [
    { icon: Users, number: '2,500+', label: 'Active Partners' },
    { icon: Globe2, number: '120+', label: 'Countries' },
    { icon: TrendingUp, number: '$2.5B+', label: 'Annual Volume' },
    { icon: Award, number: '15+', label: 'Industry Awards' },
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
              About <span className="text-gradient-primary">CIGATY</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 px-2">
              Redefining the future of global drinks commerce through innovation, 
              trust, and unparalleled service excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Story Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">Our Story</h2>
              <div className="space-y-3 md:space-y-4 text-muted-foreground text-base md:text-lg">
                <p>
                  CIGATY was born from a simple observation: the global drinks industry needed 
                  a modern, transparent, and efficient platform to connect premium brands with 
                  distributors worldwide.
                </p>
                <p>
                  Founded in 2020 by industry veterans with decades of combined experience in 
                  luxury goods, technology, and global distribution, CIGATY set out to bridge 
                  the gap between traditional business practices and cutting-edge innovation.
                </p>
                <p>
                  Today, we're proud to serve over 2,500 partners across 120+ countries, 
                  facilitating billions in annual trade volume. Our platform combines the 
                  sophistication of enterprise software with the ease of consumer applications, 
                  making global trade accessible to businesses of all sizes.
                </p>
                <p>
                  But we're more than just a marketplace. We're a community of passionate 
                  professionals united by a love for exceptional drinks and a commitment to 
                  excellence in every transaction.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-luxury border-2 border-primary/20 bg-gradient-to-br from-card to-muted">
                <div className="aspect-video flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                      <Users className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-2">Our Team</p>
                    <p className="text-muted-foreground max-w-md mx-auto">Building the future of liquor commerce</p>
                    <div className="mt-6 inline-block px-4 py-2 bg-card border border-primary/30 rounded-lg">
                      <span className="text-primary text-sm font-semibold">Team Photo Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Mission, Vision, Values */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              const gradients = ['from-primary to-primary/70', 'from-secondary to-secondary/70', 'from-primary to-primary/70'];
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
              
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: isMobile ? 0 : 30 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={isMobile ? {} : { delay: index * 0.05, duration: 0.3 }}
                  whileHover={isMobile ? {} : { y: -8, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradients[index]} rounded-2xl blur opacity-0 group-hover:opacity-60 transition duration-500`} />
                  
                  <div 
                    className="relative border-2 border-primary/40 rounded-2xl p-6 md:p-8 h-full hover:border-primary/70 transition-all duration-300 overflow-hidden text-center shadow-lg hover:shadow-xl"
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
                      className="relative mb-6 inline-block z-10"
                      whileHover={isMobile ? {} : { scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-200`}>
                        <Icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" strokeWidth={2.5} />
                      </div>
                      {/* Pulsing ring - disabled on mobile */}
                      {!isMobile && (
                        <motion.div 
                          className={`absolute inset-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${gradients[index]} opacity-20 blur-xl transition-opacity duration-500`}
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
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {value.description}
                      </p>
                      
                      {/* Animated accent bar */}
                      <motion.div
                        className={`h-1.5 bg-gradient-to-r ${gradients[index]} rounded-full mt-6 mx-auto shadow-lg`}
                        initial={{ width: isMobile ? "60%" : 0 }}
                        whileInView={isMobile ? {} : { width: "60%" }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={isMobile ? {} : { delay: index * 0.05 + 0.2, duration: 0.3 }}
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

      {/* Timeline */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Our <span className="text-gradient-primary">Journey</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Milestones that shaped our path to becoming the world's leading drinks marketplace
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative pl-8 pb-12 border-l-2 border-primary/30 last:pb-0"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-glow-primary" />
                <div className="bg-card rounded-lg p-4 md:p-6 border border-border hover:border-primary/50 transition-colors">
                  <div className="text-primary font-bold text-xl md:text-2xl mb-2">{milestone.year}</div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Team Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Meet Our <span className="text-gradient-primary">Leadership</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Experienced professionals dedicated to revolutionizing global drinks commerce
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="card text-center group"
              >
                <div className="relative mb-4 w-32 h-32 mx-auto">
                  {/* Placeholder avatar with initials */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full h-full rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-2xl border-4 border-background`}
                  >
                    <span className="text-white text-3xl font-bold">{member.initials}</span>
                  </motion.div>
                  {/* Pulsing ring effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity`}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <p className="text-primary font-bold mb-2 text-lg">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Achievements */}
      <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center"
                >
                  <div className="inline-block p-3 md:p-4 rounded-2xl bg-card border-2 border-primary/20 mb-3 md:mb-4 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">{achievement.number}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">{achievement.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

