import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketingHeader } from "@/components/marketing/Header";
import { MarketingFooter } from "@/components/marketing/Footer";
import Home from "./pages/marketing/Home";
import About from "./pages/marketing/About";
import Platform from "./pages/marketing/Platform";
import FAQs from "./pages/marketing/FAQs";
import ContactMarketing from "./pages/marketing/Contact";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicationReceived from "./pages/ApplicationReceived";
import LiveOffers from "./pages/LiveOffers";
import MyActivity from "./pages/MyActivity";
import MyStock from "./pages/MyStock";
import NotFound from "./pages/NotFound";
import Product from "./pages/Product";
import AdminApprovals from "./pages/AdminApprovals";
import AdminApprovalDetail from "./pages/AdminApprovalDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminIndex from "./pages/AdminIndex";
import TransactionManagement from "./pages/admin/TransactionManagement";
import PlatformFees from "./pages/admin/PlatformFees";
import BondedWarehouses from "./pages/admin/BondedWarehouses";
import AdminReservations from "./pages/admin/AdminReservations";
import Profile from "./pages/Profile";
import AddListing from "./pages/AddListing";
import Cart from "./pages/Cart";
import Reservations from "./pages/Reservations";
import { Protected } from "@/components/Protected";
import Checkout from "./pages/Checkout";
import Security from "./pages/Security";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import { MobileTopBar } from "@/components/navigation/MobileTopBar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/application-received'].includes(location.pathname);
  
  // Marketing pages use marketing header/footer
  const marketingPages = ['/', '/about', '/platform', '/faqs', '/contact'];
  const isMarketingPage = marketingPages.includes(location.pathname);
  const isDashboardPage = !isMarketingPage && !isAuthPage;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Marketing Header */}
      {isMarketingPage && (
        <MarketingHeader />
      )}
      {/* Dashboard Header */}
      {isDashboardPage && (
        <div className="hidden md:block">
          <Header />
        </div>
      )}
      {/* Mobile Navigation */}
      {isDashboardPage && (
        <MobileTopBar />
      )}
      <main className="flex-1 pb-20 md:pb-0 relative z-0">
        <Routes>
          {/* Marketing routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<ContactMarketing />} />

          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/application-received" element={<ApplicationReceived />} />

          {/* Public legal & trust pages */}
          <Route path="/security" element={<Security />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />

          {/* Protected routes */}
          <Route path="/live-offers" element={<Protected><LiveOffers /></Protected>} />
          <Route path="/product/:id" element={<Protected><Product /></Protected>} />

          <Route path="/admin/approvals" element={<Protected><AdminApprovals /></Protected>} />
          <Route path="/admin/approvals/:id" element={<Protected><AdminApprovalDetail /></Protected>} />
          <Route path="/admin" element={<Protected><AdminIndex /></Protected>} />
          <Route path="/admin/users" element={<Protected><AdminUsers /></Protected>} />
          <Route path="/admin/users/:id" element={<Protected><AdminUserDetail /></Protected>} />
          <Route path="/admin/transactions" element={<Protected><TransactionManagement /></Protected>} />
          <Route path="/admin/platform-fees" element={<Protected><PlatformFees /></Protected>} />
          <Route path="/admin/bonded-warehouses" element={<Protected><BondedWarehouses /></Protected>} />
          <Route path="/admin/reservations" element={<Protected><AdminReservations /></Protected>} />

          <Route path="/my-activity" element={<Protected><MyActivity /></Protected>} />
          <Route path="/my-stock" element={<Protected><MyStock /></Protected>} />
          <Route path="/reservations" element={<Protected><Reservations /></Protected>} />
          <Route path="/checkout/:orderId" element={<Protected><Checkout /></Protected>} />
          {/* Fallback for cart-based checkout that doesn't yet create an orderId */}
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/cart" element={<Protected><Cart /></Protected>} />
          <Route path="/add-listing" element={<Protected><AddListing /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* Marketing Footer */}
      {isMarketingPage && (
        <MarketingFooter />
      )}
      {/* Dashboard Footer */}
      {isDashboardPage && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      {isDashboardPage && (
        <MobileBottomNav />
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-center" />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
