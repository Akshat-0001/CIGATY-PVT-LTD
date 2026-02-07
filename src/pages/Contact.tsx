import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building2, Clock, Send, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("full_name, email, phone, company_id, company:companies(name)").eq("id", user.id).single();
  return data;
}

export default function Contact() {
  const { toast } = useToast();
  const { data: currentUser } = useQuery({
    queryKey: ["current_user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState({
    name: currentUser?.full_name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    company: (currentUser?.company as any)?.name || "",
    topic: "General",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({
        ...prev,
        name: currentUser.full_name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        company: (currentUser.company as any)?.name || prev.company,
      }));
    }
  }, [currentUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill required fields", description: "Name, email, and message are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("contact_messages").insert({
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        topic: form.topic,
        message: form.message,
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully",
        description: "We'll get back to you shortly. Thank you for contacting CIGATY.",
      });

      setForm({
        name: currentUser?.full_name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        company: (currentUser?.company as any)?.name || "",
        topic: "General",
        message: "",
      });
    } catch (e: any) {
      toast({
        title: "Failed to send message",
        description: e.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-semibold text-foreground mb-2">Contact Us</h1>
        <p className="text-lg text-muted-foreground">Get in touch with our team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="card-elevate glow-surface">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Your company"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General Inquiry</SelectItem>
                      <SelectItem value="Security Issue">Security Issue</SelectItem>
                      <SelectItem value="Privacy Request">Privacy Request</SelectItem>
                      <SelectItem value="Sales">Sales & Partnerships</SelectItem>
                      <SelectItem value="Support">Technical Support</SelectItem>
                      <SelectItem value="Billing">Billing & Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-primary">Payment is securely handled by CIGATY Escrow</strong> for all transactions
                      on our platform. Your financial information is protected with industry-standard security measures.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <span className="mr-2">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="card-elevate glow-surface">
            <CardHeader>
              <CardTitle className="text-lg">Support Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:support@cigaty.com" className="text-primary hover:underline">
                    support@cigaty.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+1-555-CIGATY" className="text-primary hover:underline">
                    +1 (555) CIGATY
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">Available during business hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-muted-foreground">Monday - Friday</p>
                  <p className="text-muted-foreground">9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevate glow-surface bg-muted/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">Escrow Support</p>
                  <p className="text-xs text-muted-foreground">
                    For questions about escrow transactions, payment releases, or dispute resolution, please select
                    "Support" or "Billing & Payments" as your topic.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevate glow-surface border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground text-center">
                <strong className="text-primary">Secure Communication</strong>
                <br />
                All messages are encrypted and stored securely. We respect your privacy and handle all inquiries
                with confidentiality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

