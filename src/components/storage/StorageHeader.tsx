
import { Button } from "@/components/ui/button";
import { LogOut, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { read, utils } from "xlsx";
import { StorageItem } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface StorageHeaderProps {
  setItems: (items: StorageItem[]) => void;
}

export function StorageHeader({ setItems }: StorageHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { user } = useAuth();

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

      console.log("Excel data imported:", jsonData);
      
      if (jsonData.length === 0) {
        toast({
          title: "Error",
          description: "El archivo Excel no contiene datos válidos",
          variant: "destructive",
        });
        return;
      }

      const newItems: StorageItem[] = jsonData.map((row: any) => ({
        id: crypto.randomUUID(), // Using UUID v4 for new items
        categoryName: row.categoryName || "Insumos",
        name: row.name,
        cost: Number(row.cost) || 0,
        unit: row.unit || "unidad",
        ivaAmount: row.ivaAmount ? Number(row.ivaAmount) : undefined,
      }));

      console.log("Saving imported items to Supabase:", newItems);
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of newItems) {
        const { error } = await supabase
          .from('storage_items')
          .insert({
            id: item.id,
            categoryName: item.categoryName,
            name: item.name,
            cost: item.cost,
            unit: item.unit || null,
            ivaAmount: item.ivaAmount || null,
          });
        
        if (error) {
          console.error("Error saving imported item to Supabase:", error, item);
          errorCount++;
        } else {
          successCount++;
        }
      }

      // Only update state and localStorage if some items were successfully saved
      if (successCount > 0) {
        const { data: updatedItems } = await supabase
          .from('storage_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (updatedItems) {
          setItems(updatedItems as StorageItem[]);
          localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        }
      }

      if (errorCount > 0) {
        toast({
          title: "Advertencia",
          description: `Importados ${successCount} items. ${errorCount} items no pudieron ser guardados en la base de datos.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Éxito",
          description: `${successCount} items importados correctamente`,
        });
      }
    } catch (error) {
      console.error("Error importing Excel file:", error);
      toast({
        title: "Error",
        description: "Error al importar el archivo Excel",
        variant: "destructive",
      });
    }
    
    event.target.value = '';
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
        {!user?.role?.includes("admin") && (
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        )}
      </div>
    </div>
  );
}
