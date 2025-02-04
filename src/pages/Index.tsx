
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, redirect based on role
  return <Navigate to={user.role === "admin" ? "/admin" : "/guest"} replace />;
};

export default Index;
