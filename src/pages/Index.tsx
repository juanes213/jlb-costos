
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, redirect based on role
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "storage":
      return <Navigate to="/storage" replace />;
    case "visits":
      return <Navigate to="/visits" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Index;
