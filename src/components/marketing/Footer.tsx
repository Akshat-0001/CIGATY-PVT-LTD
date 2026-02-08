import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Instagram, Linkedin } from 'lucide-react';

export const MarketingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Platform', path: '/platform' },
      { name: 'Careers', path: '/careers' },
    ],
    support: [
      { name: 'FAQs', path: '/faqs' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Help Center', path: '/help' },
      { name: 'Terms & Conditions', path: '/terms' },
    ],
    account: [
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' },
      { name: 'Dashboard', path: '/live-offers' },
      { name: 'My Orders', path: '/orders' },
    ],
  };

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/company/cigaty/' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/cigaty_enterprises/' },
    { name: 'Twitter', icon: Twitter, url: '#' },
  ];

  return (
    <footer className="bg-muted border-t border-border relative z-10" style={{ 
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)'
    }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <img 
                src="/assets/logo.png" 
                alt="CIGATY Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h2 className="text-2xl font-bold text-foreground">CIGATY</h2>
                <p className="text-xs text-primary">India's First B2B Liquor Exchange</p>
              </div>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
            Trade spirits, wines, beers, and premium beverages seamlessly.
            Cigaty connects verified importers, distributors, and traders in one trusted digital marketplace.
            </p>
            <div className="space-y-3">
              <a href="mailto:info@cigaty.com" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5 mr-3" />
                info@cigaty.com
              </a>
              <a href="tel:+1234567890" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-5 h-5 mr-3" />
                +91 9717194419
              </a>
              <div className="flex items-start text-muted-foreground">
                <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} CIGATY. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center 
                             text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-300"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

