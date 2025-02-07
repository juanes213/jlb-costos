
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
      <div className="flex items-center">
        <img
          src="/lovable-uploads/69132a70-cbc6-4223-b3e1-5c6d82f46a1d.png"
          alt="JL Bedoya Group Logo"
          className="h-12"
        />
      </div>
    </div>
  );
}
