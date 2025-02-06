
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (user?.role !== "admin") return null;

  return (
    <nav className="bg-white border-b p-4 mb-6">
      <div className="container flex justify-between items-center">
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            Proyectos
          </Button>
          <Button variant="ghost" onClick={() => navigate("/storage")}>
            Almacén
          </Button>
          <Button variant="ghost" onClick={() => navigate("/visits")}>
            Visitas
          </Button>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </nav>
  );
}
