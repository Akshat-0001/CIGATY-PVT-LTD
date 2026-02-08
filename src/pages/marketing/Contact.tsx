import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
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
      details: 'info@cigaty.com',
      link: 'mailto:info@cigaty.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 9717194419',
      link: 'tel:+919717194419',
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
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);

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
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <a
                    key={info.title}
                    href={info.link}
                    className="bg-card rounded-lg p-6 border text-center hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                    <p className="text-muted-foreground text-sm">{info.details}</p>
                  </a>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-foreground mb-6">Send us a Message</h2>
                
                {isSubmitted ? (
                  <div className="bg-primary/10 border border-primary rounded-lg p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className={errors.message ? 'border-destructive' : ''}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2" size={20} />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Additional Info Sidebar */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-foreground mb-3">Business Hours</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Sunday - Thursday: 9:00 AM - 6:00 PM GST</p>
                    <p>Saturday: 10:00 AM - 4:00 PM GST</p>
                    <p>Friday: Closed</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-foreground mb-3">Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For urgent matters or technical support:
                  </p>
                  <a 
                    href="mailto:support@cigaty.com" 
                    className="text-primary hover:underline inline-flex items-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    support@cigaty.com
                  </a>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-foreground mb-3">Quick Links</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check out our FAQ section:
                  </p>
                  <Link to="/faqs" className="text-primary hover:underline text-sm">
                    Visit FAQ →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
