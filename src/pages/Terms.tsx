import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, UserCheck, ShoppingCart, CreditCard, AlertTriangle, Gavel, XCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Terms governing your use of the CIGATY platform</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">v1.0</Badge>
      </div>

      {/* Introduction */}
      <Card className="card-elevate glow-surface">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">Acceptance of Terms</h2>
          </div>
          <p className="text-foreground leading-relaxed">
            These Terms and Conditions ("Terms") govern your access to and use of the CIGATY B2B liquor trading platform
            ("Platform", "Service", "we", "us", "our"). By accessing or using our Platform, you agree to be bound by these Terms.
            If you disagree with any part of these Terms, you may not access or use the Platform.
          </p>
          <p className="text-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. Material changes will be communicated through the Platform
            or via email. Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <FileText className="h-4 w-4" />
            <span>Last updated: December 2024</span>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>Eligibility & Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Eligibility Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              To use CIGATY, you must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Be at least 18 years of age (or the legal age in your jurisdiction)</li>
              <li>Be a business entity or authorized representative of a business</li>
              <li>Possess valid licenses required for alcohol trading in your jurisdiction</li>
              <li>Provide accurate and complete registration information</li>
              <li>Complete identity verification (KYC) procedures as required</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Responsibility</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
              <li>Ensuring that your account information remains accurate and up-to-date</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms,
              fraudulent activity, or any other reason we deem necessary to protect the Platform and its users.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Listings & Transactions */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle>Listings & Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Seller Obligations</h3>
            <p className="text-muted-foreground leading-relaxed">
              When listing products, sellers must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Provide accurate and complete product information</li>
              <li>Ensure products comply with all applicable laws and regulations</li>
              <li>Maintain sufficient inventory to fulfill confirmed orders</li>
              <li>Ship products in a timely manner according to agreed lead times</li>
              <li>Ensure products are delivered in the condition and quantity specified</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Buyer Obligations</h3>
            <p className="text-muted-foreground leading-relaxed">
              When purchasing products, buyers must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Complete payment as agreed through the escrow system</li>
              <li>Provide accurate delivery information</li>
              <li>Inspect delivered products promptly and report any discrepancies</li>
              <li>Confirm delivery or raise disputes within reasonable timeframes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Reservations & Orders</h3>
            <p className="text-muted-foreground leading-relaxed">
              Reservations are binding once confirmed by the seller. Orders are created from confirmed reservations and
              progress through the escrow lifecycle. Both parties agree to fulfill their obligations in good faith.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Escrow Terms */}
      <Card className="card-elevate glow-surface border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Escrow Terms</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="font-semibold text-primary mb-2">Payment is securely handled by CIGATY Escrow.</p>
            <p className="text-muted-foreground text-xs">
              All transactions are processed through our secure escrow system to protect both buyers and sellers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Escrow Lifecycle</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Orders progress through the following statuses:
            </p>
            <ul className="list-none space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">payment_pending</span>
                <span className="text-muted-foreground text-xs">Initial order created, awaiting payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">paid_in_escrow</span>
                <span className="text-muted-foreground text-xs">Payment received, funds held securely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">dispatched</span>
                <span className="text-muted-foreground text-xs">Order shipped with tracking information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">delivered</span>
                <span className="text-muted-foreground text-xs">Order delivered and confirmed by buyer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">released</span>
                <span className="text-muted-foreground text-xs">Funds released to seller</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">refunded</span>
                <span className="text-muted-foreground text-xs">Refund processed, stock restored</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Fund Release Conditions</h3>
            <p className="text-muted-foreground leading-relaxed">
              Funds are released to sellers only after:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>The order status reaches "delivered"</li>
              <li>The buyer has confirmed receipt and satisfaction</li>
              <li>No active disputes or claims are pending</li>
              <li>Administrative review (if applicable) is complete</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Refund Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Refunds may be processed in cases of:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>Product non-delivery or significant discrepancies</li>
              <li>Undisclosed defects or damage</li>
              <li>Mutual agreement between buyer and seller</li>
              <li>Administrative decision following dispute resolution</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Upon refund, stock quantities are automatically restored to the seller's inventory.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fees */}
      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="fees" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold">Fees & Charges</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Platform Fee</h4>
              <p className="text-muted-foreground leading-relaxed">
                CIGATY charges category-based platform fees on all transactions. Fees vary by product category (e.g., Beer: £3.00, Wine: £2.00, Spirits: £3.00 per item). 
                These fees are clearly displayed before order confirmation and are deducted from the total transaction amount.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payment Processing</h4>
              <p className="text-muted-foreground leading-relaxed">
                Additional payment processing fees may apply depending on the payment method and provider. These fees
                are disclosed during checkout.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Taxes</h4>
              <p className="text-muted-foreground leading-relaxed">
                All prices are exclusive of applicable taxes unless otherwise stated. Buyers are responsible for
                all taxes, duties, and customs fees associated with their purchases according to their jurisdiction.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prohibited" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Prohibited Use & Compliance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>List or trade products in violation of applicable laws or regulations</li>
              <li>Engage in fraudulent, deceptive, or misleading practices</li>
              <li>Circumvent platform fees or escrow mechanisms</li>
              <li>Interfere with the Platform's operation or security</li>
              <li>Use automated systems to scrape or extract data without permission</li>
              <li>Impersonate others or provide false information</li>
              <li>Violate intellectual property rights</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Compliance with all applicable local, state, national, and international laws and regulations is your responsibility.
              CIGATY reserves the right to remove listings, suspend accounts, or take legal action for violations.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disputes" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-primary" />
              <span className="font-semibold">Dispute Resolution</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Dispute Process</h4>
              <p className="text-muted-foreground leading-relaxed">
                In case of disputes between buyers and sellers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                <li>Parties should attempt to resolve disputes directly through communication</li>
                <li>If direct resolution fails, parties may request CIGATY administrative intervention</li>
                <li>CIGATY will review evidence, transaction records, and communications</li>
                <li>Administrative decisions may result in refunds, fund releases, or account actions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <p className="text-muted-foreground leading-relaxed">
                CIGATY acts as an intermediary platform and escrow service provider. We are not a party to transactions
                between buyers and sellers. Our liability is limited to the escrow amount and platform fees collected.
                We are not responsible for product quality, delivery delays, or disputes between parties beyond our
                administrative resolution role.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="termination" className="card-elevate glow-surface border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Termination</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 text-sm space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate their account at any time. Upon termination:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Active orders and escrow transactions must be completed or resolved</li>
              <li>Outstanding obligations remain in effect</li>
              <li>Account data may be retained as required by law or for dispute resolution</li>
              <li>Access to the Platform will be revoked</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Governing Law */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <CardTitle>Governing Law & Jurisdiction</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of [Jurisdiction]. Any disputes arising
            from or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts
            of [Jurisdiction].
          </p>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning mb-1">Legal Notice</p>
                <p className="text-xs text-muted-foreground">
                  Please consult with legal counsel in your jurisdiction to understand how these Terms apply to your
                  specific circumstances. International users are responsible for compliance with local laws.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="card-elevate glow-surface bg-muted/30">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Questions About These Terms?</p>
          <p className="text-xs text-muted-foreground">
            For questions or clarifications regarding these Terms, please contact us through our{" "}
            <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

