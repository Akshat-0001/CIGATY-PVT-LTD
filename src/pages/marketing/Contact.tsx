import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Globe2, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'director@cigaty.com',
      link: 'mailto:director@cigaty.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 9717194419',
      link: 'tel:+91 9717194419',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: 'Burj Khalifa, Downtown Dubai, UAE',
      link: '#',
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Form submission handled by backend/dashboard
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-background overflow-hidden">
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
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Get in <span className="text-gradient-primary">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and 
              we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={info.title}
                  href={info.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.15, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="card text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{info.title}</h3>
                  <p className="text-muted-foreground">{info.details}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Contact Form Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 md:mb-6">Send us a Message</h2>
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                    <p className="text-foreground">
                      Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (234) 567-890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your Company"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                        className={errors.subject ? 'border-destructive' : ''}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                        className={errors.message ? 'border-destructive' : ''}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      disabled={isSubmitting}
                      className="group w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 space-y-8"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 md:mb-4">Business Hours</h3>
                  <div className="space-y-2 text-sm md:text-base text-muted-foreground">
                    <p>Sunday - Thursday: 9:00 AM - 6:00 PM GST</p>
                    <p>Saturday: 10:00 AM - 4:00 PM GST</p>
                    <p>Friday: Closed</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 md:mb-4">Support</h3>
                  <p className="text-muted-foreground mb-4">
                    For urgent matters or technical support, please email us at:
                  </p>
                  <a 
                    href="mailto:support@cigaty.com" 
                    className="text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    support@cigaty.com
                  </a>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 md:mb-4">Sales Inquiries</h3>
                  <p className="text-muted-foreground mb-4">
                    Interested in partnering with us? Contact our sales team:
                  </p>
                  <a 
                    href="mailto:sales@cigaty.com" 
                    className="text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    sales@cigaty.com
                  </a>
                </div>

                <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Need Immediate Help?</h4>
                  <p className="text-foreground text-sm mb-4">
                    Check out our FAQ section for quick answers to common questions.
                  </p>
                  <Link to="/faqs" className="text-primary hover:text-primary/80 font-medium">
                    Visit FAQ →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider my-8" />

      {/* Map Section - Dubai Location */}
      <section className="py-12 md:py-16 bg-muted relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Our <span className="text-gradient-primary">Headquarters</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visit our office at the heart of Dubai's business district
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-6xl mx-auto"
          >
            {/* Map container with decorative frame */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
              
              {/* Map frame */}
              <div className="relative glass-effect border-2 border-primary/30 rounded-3xl p-2 overflow-hidden">
                <div className="rounded-2xl overflow-hidden shadow-2xl h-[500px] relative bg-muted">
                  {/* Google Maps Embed - Using coordinates directly */}
                  <iframe
                    src="https://maps.google.com/maps?q=25.1972,55.2744&hl=en&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="CIGATY Office Location - Dubai"
                    className="w-full h-full"
                  />
                  
                  {/* Custom overlay info card */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute top-6 left-6 glass-effect border border-primary/30 rounded-2xl p-6 max-w-xs backdrop-blur-xl shadow-2xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                        <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">CIGATY Office</h3>
                        <p className="text-sm text-foreground mb-2">Burj Khalifa Area</p>
                        <p className="text-xs text-primary font-semibold">
                          25.1972° N, 55.2744° E
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Location details below map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mt-8"
            >
              <div className="glass-effect border border-primary/20 rounded-2xl p-6 text-center hover:border-primary/40 transition-all">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-foreground mb-2">Address</h4>
                <p className="text-muted-foreground text-sm">
                  Burj Khalifa, Downtown Dubai<br />
                  Dubai, United Arab Emirates
                </p>
              </div>
              
              <div className="glass-effect border border-primary/20 rounded-2xl p-6 text-center hover:border-primary/40 transition-all">
                <Globe2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-foreground mb-2">Coordinates</h4>
                <p className="text-muted-foreground text-sm">
                  Latitude: 25.1972° N<br />
                  Longitude: 55.2744° E
                </p>
              </div>
              
              <div className="glass-effect border border-primary/20 rounded-2xl p-6 text-center hover:border-primary/40 transition-all">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-foreground mb-2">Working Hours</h4>
                <p className="text-muted-foreground text-sm">
                  Sunday - Thursday<br />
                  9:00 AM - 6:00 PM GST
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

