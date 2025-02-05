
import { Button } from "@/components/ui/button";
import { LogOut, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { read, utils } from "xlsx";
import { StorageItem } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

interface StorageHeaderProps {
  setItems: (items: StorageItem[]) => void;
}

export function StorageHeader({ setItems }: StorageHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      const newItems: StorageItem[] = jsonData.map((row: any) => ({
        id: crypto.randomUUID(),
        categoryName: row.categoryName || "Insumos",
        name: row.name,
        cost: Number(row.cost),
        unit: row.unit || "unidad",
        ivaAmount: row.ivaAmount ? Number(row.ivaAmount) : undefined,
      }));

      setItems(newItems);
      localStorage.setItem("storageItems", JSON.stringify(newItems));

      toast({
        title: "Éxito",
        description: "Datos importados correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al importar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Gestión de Almacén</h1>
        <p className="text-muted-foreground">
          Agregue y gestione items y categorías
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
        </label>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
