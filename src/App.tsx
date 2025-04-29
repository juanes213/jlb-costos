
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ProjectProvider } from "@/contexts/project";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import GuestDashboard from "./pages/GuestDashboard";
import CustomerVisits from "./pages/CustomerVisits";
import ProjectsDashboard from "./pages/ProjectsDashboard";
import CalendarPage from "./pages/CalendarPage";
import AdminNav from "./components/admin/AdminNav";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Index from "./pages/Index";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

// Create a function to check and create the storage bucket if it doesn't exist
async function ensureStorageBucket() {
  try {
    // Check if the bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking storage buckets:", listError);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === "project_quotes");
    
    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket("project_quotes", {
        public: false,
        allowedMimeTypes: ["application/pdf"],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error("Error creating storage bucket:", error);
      } else {
        console.log("Storage bucket created successfully:", data);
      }
    }
  } catch (error) {
    console.error("Error in ensureStorageBucket:", error);
  }
}

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      ensureStorageBucket();
    }
  }, [user]);

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

  return <>{children}</>;
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
                    <ProtectedRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/storage"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <GuestDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/visits"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <CustomerVisits />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <ProjectsDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <AdminLayout>
                        <CalendarPage />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Index />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}

export default App;
