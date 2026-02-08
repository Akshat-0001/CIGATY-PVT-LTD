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
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center py-8 md:py-12 px-4">
        <div className="max-w-5xl w-full">
          {/* Logo Header */}
          <Link to="/" className="flex items-center justify-center mb-6 md:mb-12">
            <img 
              src="/logo.png" 
              alt="CIGATY Logo" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Main Success Card */}
          <div className="bg-card border rounded-lg p-6 md:p-8 lg:p-12 mb-6 md:mb-8 text-center">
            {/* Success Icon */}
            <div className="inline-block mb-6 md:mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight px-2">
              Application <span className="text-primary">Received!</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 md:mb-4 max-w-3xl mx-auto px-2">
              Welcome to <span className="text-primary font-bold">CIGATY</span> – India's Premier B2B Liquor Exchange Platform
            </p>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Thank you for choosing us as your trusted partner in global drinks trade. 
              Your application is now in our hands.
            </p>

            {/* Stats/Timeline bar */}
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-foreground font-semibold text-base md:text-lg mb-1">
                Expected Response Time
              </p>
              <p className="text-primary text-2xl md:text-3xl font-bold">24-48 Hours</p>
            </div>
          </div>

          {/* Application Process Timeline */}
          <div className="bg-card border rounded-lg p-6 md:p-8 lg:p-10 mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center px-2">
              What Happens <span className="text-primary">Next?</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 md:mb-10 px-2">
              Here's our streamlined onboarding process
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="text-center">
                    {/* Icon */}
                    <div className="inline-block mb-3 md:mb-4 relative">
                      <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${
                        index % 2 === 0 ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'
                      } flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
                      </div>
                      {/* Number badge */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-xs md:text-sm">{index + 1}</span>
                      </div>
                    </div>

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
                );
              })}
            </div>

            {/* Support Section */}
            <div className="mt-6 md:mt-10 p-4 md:p-6 bg-primary/10 border border-primary/30 rounded-lg">
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
                    className="px-4 md:px-6 py-2 md:py-3 bg-background border border-primary/50 rounded-lg text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">support@cigaty.com</span>
                    <span className="sm:hidden">Email Support</span>
                  </a>
                  <a 
                    href="tel:+919717194419"
                    className="px-4 md:px-6 py-2 md:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-sm md:text-base"
                  >
                    +91 797 305 9650
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                Back to Home
              </Button>
            </Link>
            <Link to="/platform">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Platform Features
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReceived;

