import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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
    // This is a placeholder for future edit functionality
    console.log("Edit item:", item);
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <StorageHeader />
      <StorageForm onAddItem={handleAddItem} />
      <StorageTable
        items={items}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
      />
    </div>
  );
}
