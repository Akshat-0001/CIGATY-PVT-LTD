import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import Profile from "./pages/Profile";
import AddListing from "./pages/AddListing";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/application-received'].includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/application-received" element={<ApplicationReceived />} />
          <Route path="/live-offers" element={<LiveOffers />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/approvals/:id" element={<AdminApprovalDetail />} />
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/my-activity" element={<MyActivity />} />
          <Route path="/my-stock" element={<MyStock />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
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
