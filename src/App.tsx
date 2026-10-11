import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import RiskPredictorPage from "./pages/RiskPredictorPage";
import DonorNetworkPage from "./pages/DonorNetworkPage";
import EmergencyPage from "./pages/EmergencyPage";
import ProfilePage from "./pages/ProfilePage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ReferralsPage from "./pages/ReferralsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import NotFound from "./pages/NotFound";
import { RoleProvider } from "./contexts/RoleContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/risk-predictor" element={<ProtectedRoute><RiskPredictorPage /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
            <Route path="/donors" element={<ProtectedRoute><DonorNetworkPage /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
