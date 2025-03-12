
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
import ProjectsDashboard from "./pages/ProjectsDashboard";
import AdminNav from "./components/admin/AdminNav";
import { LoadingSpinner } from "./components/ui/loading-spinner";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ("admin" | "storage" | "visits" | "projects")[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "storage":
        return <Navigate to="/storage" replace />;
      case "visits":
        return <Navigate to="/visits" replace />;
      case "projects":
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <>{children}</>;
  
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}

function App() {
  return (
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
                    <ProtectedRoute allowedRoles={["admin", "projects"]}>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/storage"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "storage"]}>
                      <AdminLayout>
                        <GuestDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/visits"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "visits"]}>
                      <AdminLayout>
                        <CustomerVisits />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "projects", "storage", "visits"]}>
                      <AdminLayout>
                        <ProjectsDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
