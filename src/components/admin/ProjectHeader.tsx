import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage projects and their categories
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate("/login")}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}