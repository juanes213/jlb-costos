import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Special handling for cfinanciero user who has projects role but should access admin
  if (user.username === "cfinanciero@jorgebedoya.com") {
    return <Navigate to="/admin" replace />;
  }

  // For other users, redirect based on role
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "storage":
      return <Navigate to="/storage" replace />;
    case "visits":
      return <Navigate to="/visits" replace />;
    case "projects":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Index;
