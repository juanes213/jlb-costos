
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
      <div className="flex items-center">
        <img
          src="/lovable-uploads/69132a70-cbc6-4223-b3e1-5c6d82f46a1d.png"
          alt="JL Bedoya Group Logo"
          className="h-12"
        />
      </div>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar sesión
      </Button>
    </div>
  );
}
