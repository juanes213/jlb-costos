
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import type { StorageItem } from "@/types/project";
import { StorageHeader } from "@/components/storage/StorageHeader";
import { StorageForm } from "@/components/storage/StorageForm";
import { StorageTable } from "@/components/storage/StorageTable";

export default function GuestDashboard() {
  const [items, setItems] = useState<StorageItem[]>(() => {
    const savedItems = localStorage.getItem("storageItems");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const { toast } = useToast();

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

  const handleAddItem = (newItem: StorageItem) => {
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("storageItems", JSON.stringify(updatedItems));
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem("storageItems", JSON.stringify(updatedItems));

    toast({
      title: "Éxito",
      description: "Item eliminado correctamente",
    });
  };

  const handleEditItem = (item: StorageItem) => {
    console.log("Edit item:", item);
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <StorageHeader setItems={setItems} />
      <div className="flex justify-between items-center">
        <StorageForm onAddItem={handleAddItem} />
      </div>
      <StorageTable
        items={items}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
      />
    </div>
  );
}
