import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Clock, FileCheck, Users, Shield, ArrowRight } from 'lucide-react';
import Button from '../components/forms/Button';

const ApplicationReceived = () => {
  const timeline = [
    {
      icon: Mail,
      title: 'Email Verification',
      description: 'Check your inbox for a verification link',
      time: 'Immediate',
    },
    {
      icon: FileCheck,
      title: 'Document Review',
      description: 'Our team reviews your application and documents',
      time: '12-24 hours',
    },
    {
      icon: Shield,
      title: 'Compliance Check',
      description: 'Verification of licenses and certifications',
      time: '24-48 hours',
    },
    {
      icon: Users,
      title: 'Account Activation',
      description: "You'll receive your login credentials",
      time: '48 hours',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Elegant floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-primary/20 to-primary/10"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100 - Math.random() * 50, 0],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 md:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full"
        >
          {/* Logo Header */}
          <Link to="/" className="flex items-center justify-center mb-6 md:mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              className="relative"
            >
              <img 
                src="/logo.png" 
                alt="CIGATY Logo" 
                className="h-16 md:h-20 w-auto object-contain"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl -z-10" />
            </motion.div>
          </Link>

          {/* Main Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-effect border-2 border-primary/30 rounded-3xl p-6 md:p-8 lg:p-12 mb-6 md:mb-8 text-center relative overflow-hidden"
          >
            {/* Decorative corner gradients */}
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
              className="relative inline-block mb-6 md:mb-8"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
              </div>
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight px-2"
            >
              Application <span className="text-gradient-primary">Received!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 md:mb-4 max-w-3xl mx-auto px-2"
            >
              Welcome to <span className="text-primary font-bold">CIGATY</span> – India's Premier B2B Liquor Exchange Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2"
            >
              Thank you for choosing us as your trusted partner in global drinks trade. 
              Your application is now in our hands.
            </motion.p>

            {/* Stats/Timeline bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 rounded-2xl border border-primary/30"
            >
              <p className="text-foreground font-semibold text-base md:text-lg mb-1">
                Expected Response Time
              </p>
              <p className="text-primary text-2xl md:text-3xl font-bold">24-48 Hours</p>
            </motion.div>
          </motion.div>

          {/* Application Process Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="glass-effect border border-primary/20 rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center px-2">
              What Happens <span className="text-gradient-primary">Next?</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 md:mb-10 px-2">
              Here's our streamlined onboarding process
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.15 }}
                    className="relative group"
                  >
                    {/* Connector line */}
                    {index < timeline.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gold/50 to-transparent -z-10" />
                    )}

                    <div className="text-center">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative inline-block mb-3 md:mb-4"
                      >
                        <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${
                          index % 2 === 0 ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'
                        } flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}>
                          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
                        </div>
                        {/* Number badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-xs md:text-sm">{index + 1}</span>
                        </div>
                      </motion.div>

                      {/* Content */}
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 min-h-[40px]">
                        {step.description}
                      </p>
                      <div className="inline-block px-2 md:px-3 py-1 bg-primary/20 border border-primary/40 rounded-full">
                        <span className="text-primary text-xs font-semibold">{step.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="mt-6 md:mt-10 p-4 md:p-6 bg-gradient-to-r from-primary/30 to-primary/20 border border-primary/30 rounded-2xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                    Need Assistance?
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Our dedicated support team is here to help you
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <a 
                    href="mailto:support@cigaty.com"
                    className="px-4 md:px-6 py-2 md:py-3 bg-background border border-primary/50 rounded-xl text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">support@cigaty.com</span>
                    <span className="sm:hidden">Email Support</span>
                  </a>
                  <a 
                    href="tel:+919717194419"
                    className="px-4 md:px-6 py-2 md:py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-sm md:text-base"
                  >
                    +91 797 305 9650
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
          >
            <Link to="/" className="group">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowRight className="w-5 h-5 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
            <Link to="/platform" className="group">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto pulse-glow-gold">
                Explore Platform Features
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplicationReceived;

