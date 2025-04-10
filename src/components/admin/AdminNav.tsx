
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  LogOut, 
  Calendar
} from "lucide-react";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-background sticky top-0 z-30 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link
            to="/admin"
            className={`flex items-center text-sm font-medium transition-colors ${
              isActive("/admin")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Proyectos</span>
          </Link>
          <Link
            to="/storage"
            className={`flex items-center text-sm font-medium transition-colors ${
              isActive("/storage")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            <span>Almacén</span>
          </Link>
          <Link
            to="/visits"
            className={`flex items-center text-sm font-medium transition-colors ${
              isActive("/visits")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Visitas</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center text-sm font-medium transition-colors ${
              isActive("/dashboard")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/calendar"
            className={`flex items-center text-sm font-medium transition-colors ${
              isActive("/calendar")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>Calendario</span>
          </Link>
        </nav>
        <div className="flex items-center">
          <Separator orientation="vertical" className="h-6 mx-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
