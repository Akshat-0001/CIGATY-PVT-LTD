import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, Info, AlertCircle } from "lucide-react";

export default function Cookies() {
  return (
    <div className="container py-4 md:py-8 px-4 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">Cookies Policy</h1>
          <p className="text-base sm:text-lg text-muted-foreground">How we use cookies and similar technologies</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">v1.0</Badge>
      </div>

      {/* Overview */}
      <Card className="card-elevate glow-surface">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">What Are Cookies?</h2>
          </div>
          <p className="text-foreground leading-relaxed">
            Cookies are small text files that are placed on your device when you visit a website. They help websites
            remember your preferences, improve performance, and provide a better user experience. CIGATY uses cookies
            and similar technologies to enhance your experience on our platform.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Info className="h-4 w-4" />
            <span>Last updated: December 2024</span>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Categories */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Types of Cookies We Use</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Strictly Necessary Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies are essential for the platform to function properly. They enable core features such as
              authentication, session management, and security. Without these cookies, services you request cannot be provided.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Functional Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies allow the platform to remember choices you make (such as your language preference, currency,
              or region) and provide enhanced, personalized features. They may also be used to provide services you have requested.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Analytics Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies help us understand how visitors interact with our platform by collecting and reporting
              information anonymously. This helps us improve website structure, content, and user experience.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Marketing Cookies (Future)</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies may be used in the future to deliver relevant advertisements and track campaign effectiveness.
              They remember that you have visited our platform and may share this information with advertising networks.
              We will notify users before implementing marketing cookies and obtain appropriate consent.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Details Table */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <CardTitle>Cookie Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cookie Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">sb-*</TableCell>
                  <TableCell>Supabase authentication session management</TableCell>
                  <TableCell><Badge variant="outline">Strictly Necessary</Badge></TableCell>
                  <TableCell>Session / 1 year</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">supabase.auth.token</TableCell>
                  <TableCell>Stores authentication tokens securely</TableCell>
                  <TableCell><Badge variant="outline">Strictly Necessary</Badge></TableCell>
                  <TableCell>Session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">reservations_active_tab</TableCell>
                  <TableCell>Remembers your selected tab preference on Reservations page</TableCell>
                  <TableCell><Badge variant="secondary">Functional</Badge></TableCell>
                  <TableCell>Persistent (localStorage)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">cart_items</TableCell>
                  <TableCell>Stores your shopping cart items locally</TableCell>
                  <TableCell><Badge variant="secondary">Functional</Badge></TableCell>
                  <TableCell>Session (localStorage)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">_analytics_*</TableCell>
                  <TableCell>Platform usage analytics (anonymized)</TableCell>
                  <TableCell><Badge>Analytics</Badge></TableCell>
                  <TableCell>2 years</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Cookie names and purposes may change as we update our platform. This table is updated
              periodically to reflect current cookie usage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Managing Cookies */}
      <Card className="card-elevate glow-surface border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>How to Manage Cookies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Browser Settings</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Most web browsers allow you to control cookies through their settings preferences. You can:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Block all cookies</li>
              <li>Block third-party cookies</li>
              <li>Delete cookies from your browser</li>
              <li>Set your browser to notify you when cookies are placed</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Please note that blocking strictly necessary cookies may impact your ability to use certain features of our platform.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Platform Cookie Preferences (Coming Soon)</h3>
            <p className="text-muted-foreground leading-relaxed">
              We are developing an in-platform cookie preferences center where you can manage your cookie preferences
              granularly. This will allow you to accept or decline specific categories of cookies without affecting
              platform functionality.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Cookies */}
      <Card className="card-elevate glow-surface">
        <CardHeader>
          <CardTitle>Third-Party Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            Some cookies on our platform are set by third-party services that we use to enhance functionality:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
            <li>
              <strong>Supabase:</strong> Sets authentication and session cookies necessary for user authentication
              and secure access to platform features.
            </li>
            <li>
              <strong>Stripe (future):</strong> May set cookies related to payment processing and fraud prevention
              when you interact with payment flows.
            </li>
            <li>
              <strong>Analytics Providers:</strong> May set cookies to track usage patterns and improve our services.
            </li>
          </ul>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning mb-1">Important Note</p>
                <p className="text-xs text-muted-foreground">
                  Third-party cookies are subject to the privacy policies of those third parties. We recommend reviewing
                  their privacy policies for information about how they use cookies.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card className="card-elevate glow-surface bg-muted/30">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Cookie Policy Updates</p>
          <p className="text-xs text-muted-foreground">
            We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
            "Last updated" date. Continued use of our platform after changes constitutes acceptance of the updated policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

