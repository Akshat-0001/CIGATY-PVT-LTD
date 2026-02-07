import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Globe, FileText, Mail, Lock, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-base sm:text-lg text-muted-foreground">How we collect, use, and protect your personal information</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">v1.0</Badge>
      </div>

      {/* Introduction */}
      <Card className="card-elevate glow-surface">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">Introduction</h2>
          </div>
          <p className="text-foreground leading-relaxed">
            At CIGATY, we are committed to protecting your privacy and ensuring the security of your personal data.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
            our B2B liquor trading platform.
          </p>
          <p className="text-foreground leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy.
            If you do not agree with our policies and practices, please do not use our services.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <FileText className="h-4 w-4" />
            <span>Last updated: December 2024</span>
          </div>
        </CardContent>
      </Card>

      {/* Data We Collect */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data We Collect</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Account Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company information (name, country, registration details)</li>
              <li>KYC documents (for verification purposes)</li>
              <li>Currency preferences</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Listing & Transaction Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you list products or make transactions, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Product details (name, category, pricing, images, specifications)</li>
              <li>Warehouse and logistics information</li>
              <li>Reservation and order details</li>
              <li>Payment and escrow transaction records</li>
              <li>Delivery and tracking information</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Usage & Technical Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Search queries and filters used</li>
              <li>Error logs and performance metrics</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Data */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>How We Use Your Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Service Provision</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use your data to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Create and manage your account</li>
              <li>Process and fulfill orders and reservations</li>
              <li>Facilitate escrow transactions and payment processing</li>
              <li>Verify your identity and company credentials</li>
              <li>Enable communication between buyers and sellers</li>
              <li>Provide customer support and respond to inquiries</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Platform Improvement</h3>
            <p className="text-muted-foreground leading-relaxed">
              We analyze usage data to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Improve platform functionality and user experience</li>
              <li>Detect and prevent fraud, abuse, or security threats</li>
              <li>Conduct research and analytics</li>
              <li>Develop new features and services</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal & Compliance</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may use your data to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Comply with legal obligations and regulatory requirements</li>
              <li>Respond to legal requests or court orders</li>
              <li>Protect our rights, property, or safety, or that of our users</li>
              <li>Enforce our Terms & Conditions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Legal Bases */}
      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="legal" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Legal Bases for Processing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              We process your personal data based on the following legal bases:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Consent:</strong> When you provide explicit consent (e.g., marketing communications)</li>
              <li><strong>Contract Performance:</strong> To fulfill our obligations under the service agreement</li>
              <li><strong>Legitimate Interests:</strong> For fraud prevention, security, and platform improvement</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sharing" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-semibold">Data Sharing & Disclosures</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Providers</h4>
              <p className="text-muted-foreground leading-relaxed">
                We share data with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                <li><strong>Supabase:</strong> Database hosting and authentication services</li>
                <li><strong>Stripe (future):</strong> Payment processing and escrow management</li>
                <li><strong>Analytics Providers:</strong> For platform usage analysis (with anonymized data where possible)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Business Transfers</h4>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity.
                We will notify you of any such change in ownership.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legal Requirements</h4>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your data if required by law, court order, or government regulation, or to protect our rights
                and the safety of our users.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="retention" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Data Retention & Deletion</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations (e.g., tax records, transaction history)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain security and prevent fraud</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              When you request account deletion, we will delete or anonymize your personal data within 30 days, except where
              retention is required by law or for legitimate business purposes (e.g., transaction records).
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Your Rights */}
      <Card className="card-elevate glow-surface border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Your Privacy Rights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-foreground leading-relaxed">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal obligations)</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
            <p className="font-semibold text-primary mb-1">To Exercise Your Rights</p>
            <p className="text-muted-foreground text-xs">
              Please contact us through our <Link to="/contact" className="text-primary hover:underline">Contact page</Link> and
              select "Privacy Request" as the topic. We will respond to your request within 30 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="card-elevate glow-surface bg-muted/30">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Questions About Privacy?</p>
          <p className="text-xs text-muted-foreground">
            For privacy-related inquiries or to exercise your rights, please visit our{" "}
            <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

