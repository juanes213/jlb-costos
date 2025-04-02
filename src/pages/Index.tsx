
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For now, all authenticated users go to admin
  return <Navigate to="/admin" replace />;
};

export default Index;
