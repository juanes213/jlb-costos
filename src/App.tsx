
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GuestDashboard from "./pages/GuestDashboard";
import CustomerVisits from "./pages/CustomerVisits";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "guest" | "visits";
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "guest":
      return <Navigate to="/guest" replace />;
    case "visits":
      return <Navigate to="/visits" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guest"
                element={
                  <ProtectedRoute requiredRole="guest">
                    <GuestDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visits"
                element={
                  <ProtectedRoute requiredRole="visits">
                    <CustomerVisits />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<DashboardRouter />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
