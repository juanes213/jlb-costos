import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      const redirectPath = determineRedirectPath(username.toLowerCase());
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  const determineRedirectPath = (username: string) => {
    if (username.includes("admin")) return "/admin";
    if (username.includes("storage")) return "/storage";
    if (username.includes("visits")) return "/visits";
    return "/admin"; // Default path for unspecified cases
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <img
            src="/lovable-uploads/69132a70-cbc6-4223-b3e1-5c6d82f46a1d.png"
            alt="JL Bedoya Group Logo"
            className="h-16 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">Bienvenido a JLB</h2>
          <p className="text-muted-foreground mt-2">
            Inicie sesión para continuar
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Nombre de usuario
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
