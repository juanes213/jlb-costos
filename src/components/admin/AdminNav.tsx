import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error al cerrar sesión");
    }
  };

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
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
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
