import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Server, CreditCard, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

export default function Security() {
  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">Security</h1>
          <p className="text-base sm:text-lg text-muted-foreground">How we protect your data, accounts, and transactions</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">v1.0</Badge>
      </div>

      {/* Overview */}
      <Card className="card-elevate glow-surface">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">Our Commitment</h2>
          </div>
          <p className="text-foreground leading-relaxed">
            CIGATY employs a defense-in-depth security strategy to safeguard your data, accounts, and financial transactions.
            We continuously monitor, audit, and improve our security posture to maintain industry-leading standards.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <FileText className="h-4 w-4" />
            <span>Last updated: December 2024</span>
          </div>
        </CardContent>
      </Card>

      {/* Payments & Escrow - Highlighted */}
      <Card className="card-elevate glow-surface border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Payments & Escrow</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="font-semibold text-primary mb-2">Payment is securely handled by CIGATY Escrow.</p>
            <p className="text-sm text-foreground">
              All transactions on our platform are processed through our secure escrow system. Funds are held in escrow until
              delivery is confirmed by the buyer, ensuring protection for both parties.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Order Lifecycle Protection</p>
                <p className="text-muted-foreground">
                  Orders progress through verified statuses: <code className="bg-muted px-1 rounded">payment_pending</code> → 
                  <code className="bg-muted px-1 rounded"> paid_in_escrow</code> → 
                  <code className="bg-muted px-1 rounded"> dispatched</code> → 
                  <code className="bg-muted px-1 rounded"> delivered</code> → 
                  <code className="bg-muted px-1 rounded"> released</code> or <code className="bg-muted px-1 rounded">refunded</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Fund Release</p>
                <p className="text-muted-foreground">
                  Funds are released to sellers only after buyers confirm delivery and satisfaction. In case of disputes or issues,
                  refunds are processed with stock restoration.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Admin Oversight</p>
                <p className="text-muted-foreground">
                  All escrow transactions are monitored by our administrative team to ensure compliance and resolve any disputes
                  promptly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sections */}
      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="product" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Product Security</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Authentication & Session Management</h4>
              <p className="text-muted-foreground leading-relaxed">
                We use Supabase Auth for secure user authentication. All sessions are protected with HTTPS, and authentication
                tokens are stored securely. Password requirements enforce strong passwords, and we support secure password reset flows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Authorization & Access Control</h4>
              <p className="text-muted-foreground leading-relaxed">
                Database-level Row Level Security (RLS) policies ensure users can only access data they own or are authorized to view.
                Seller listings are visible to all authenticated users, but modification is restricted to the listing owner.
                Reservation data is accessible only to the buyer, seller, and administrators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Input Validation & Sanitization</h4>
              <p className="text-muted-foreground leading-relaxed">
                All user inputs are validated on both client and server sides. Database stored procedures (RPC functions) perform
                additional validation before executing business logic. SQL injection protection is enforced through parameterized queries.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Audit Logging</h4>
              <p className="text-muted-foreground leading-relaxed">
                Critical operations such as order creation, payment allocation, and escrow releases are logged in our inventory ledger
                with timestamps, user identification, and action details. This enables traceability and forensic analysis when needed.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="infra" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-primary" />
              <span className="font-semibold">Infrastructure & Data Protection</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Data Hosting</h4>
              <p className="text-muted-foreground leading-relaxed">
                All data is hosted on Supabase, which uses PostgreSQL databases running on secure, managed infrastructure.
                Supabase provides enterprise-grade security, compliance certifications, and continuous monitoring.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Encryption</h4>
              <p className="text-muted-foreground leading-relaxed">
                <strong>At Rest:</strong> All database data is encrypted at rest using industry-standard encryption algorithms.
                <br />
                <strong>In Transit:</strong> All communications between clients and our servers use TLS 1.2 or higher. API endpoints
                enforce HTTPS-only connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backups & Recovery</h4>
              <p className="text-muted-foreground leading-relaxed">
                Regular automated backups are performed by our infrastructure provider. Backup retention policies ensure we can restore
                data from multiple points in time. Recovery procedures are tested periodically to ensure business continuity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Environment Separation</h4>
              <p className="text-muted-foreground leading-relaxed">
                Development, staging, and production environments are strictly separated. Production credentials and secrets are never
                used in non-production environments. Access to production systems is limited to authorized personnel only.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disclosure" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Responsible Disclosure</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              If you believe you have discovered a security vulnerability in CIGATY, we appreciate your help in disclosing it to us
              responsibly. Please use our Contact page and select "Security Issue" as the topic. Include details about the vulnerability,
              steps to reproduce it, and any potential impact.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We commit to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Responding to your report within 48 hours</li>
              <li>Working with you to understand and resolve the issue</li>
              <li>Keeping you informed of our progress</li>
              <li>Crediting you (if desired) for responsible disclosure after the issue is resolved</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="compliance" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Compliance & Third-Party Security</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Third-Party Services</h4>
              <p className="text-muted-foreground leading-relaxed">
                We use trusted third-party services for authentication, database hosting, and payment processing:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                <li><strong>Supabase:</strong> Authentication and database services with SOC 2 compliance</li>
                <li><strong>Stripe (future):</strong> Payment processing with PCI DSS Level 1 certification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Security Updates</h4>
              <p className="text-muted-foreground leading-relaxed">
                We regularly update our dependencies and infrastructure to address security vulnerabilities. Critical security patches
                are applied immediately. Our security team monitors security advisories and threat intelligence sources.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Trust Indicators */}
      <Card className="card-elevate glow-surface bg-muted/30">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Your Security is Our Priority</p>
          <p className="text-xs text-muted-foreground">
            For questions about security or to report an issue, please contact us through our{" "}
            <a href="/contact" className="text-primary hover:underline">Contact page</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

