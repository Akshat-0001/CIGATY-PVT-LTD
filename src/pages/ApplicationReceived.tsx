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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-wine/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
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
              className="absolute rounded-full bg-gradient-to-br from-gold/30 to-wine/20"
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

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full"
        >
          {/* Logo Header */}
          <Link to="/" className="flex items-center justify-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              className="relative"
            >
              <img 
                src="/logo.png" 
                alt="CIGATY Logo" 
                className="h-20 w-auto object-contain"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gold/20 blur-2xl -z-10" />
            </motion.div>
          </Link>

          {/* Main Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-effect border-2 border-gold/30 rounded-3xl p-8 md:p-12 mb-8 text-center relative overflow-hidden"
          >
            {/* Decorative corner gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold/10 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-wine/10 to-transparent rounded-full blur-3xl -z-10" />

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 10 }}
              className="relative inline-block mb-8"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-wine to-gold flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-gold"
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
              className="text-4xl md:text-6xl font-bold text-light mb-6 leading-tight"
            >
              Application <span className="text-gradient-gold">Received!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
            >
              Welcome to <span className="text-gold font-bold">CIGATY</span> – India's Premier B2B Liquor Exchange Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Thank you for choosing us as your trusted partner in global drinks trade. 
              Your application is now in our hands.
            </motion.p>

            {/* Stats/Timeline bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-8 p-6 bg-gradient-to-r from-wine/20 via-gold/20 to-wine/20 rounded-2xl border border-gold/30"
            >
              <p className="text-light font-semibold text-lg mb-1">
                Expected Response Time
              </p>
              <p className="text-gold text-3xl font-bold">24-48 Hours</p>
            </motion.div>
          </motion.div>

          {/* Application Process Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="glass-effect border border-gold/20 rounded-3xl p-8 md:p-10 mb-8"
          >
            <h2 className="text-3xl font-bold text-light mb-2 text-center">
              What Happens <span className="text-gradient-gold">Next?</span>
            </h2>
            <p className="text-gray-400 text-center mb-10">
              Here's our streamlined onboarding process
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        className="relative inline-block mb-4"
                      >
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${
                          index % 2 === 0 ? 'from-wine to-red-700' : 'from-gold to-yellow-600'
                        } flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}>
                          <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                        {/* Number badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-dark border-2 border-gold rounded-full flex items-center justify-center">
                          <span className="text-gold font-bold text-sm">{index + 1}</span>
                        </div>
                      </motion.div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-light mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3 min-h-[40px]">
                        {step.description}
                      </p>
                      <div className="inline-block px-3 py-1 bg-gold/20 border border-gold/40 rounded-full">
                        <span className="text-gold text-xs font-semibold">{step.time}</span>
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
              className="mt-10 p-6 bg-gradient-to-r from-wine/30 to-gold/20 border border-gold/30 rounded-2xl"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-light mb-1">
                    Need Assistance?
                  </h3>
                  <p className="text-gray-300">
                    Our dedicated support team is here to help you
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="mailto:support@cigaty.com"
                    className="px-6 py-3 bg-dark border border-gold/50 rounded-xl text-gold hover:bg-gold hover:text-dark transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    support@cigaty.com
                  </a>
                  <a 
                    href="tel:+917973059650"
                    className="px-6 py-3 bg-gold text-dark rounded-xl hover:bg-gold-light transition-all font-semibold"
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
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

