import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import FloatingDock from "@/components/FloatingDock";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginSuccessAnimation from "@/components/LoginSuccessAnimation";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showLoginSuccess, hideLoginSuccess, user } = useAuth();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingDock />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      
      {/* Login Success Animation */}
      <LoginSuccessAnimation
        isVisible={showLoginSuccess}
        onAnimationComplete={hideLoginSuccess}
        userName={user?.displayName || undefined}
      />
    </TooltipProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
