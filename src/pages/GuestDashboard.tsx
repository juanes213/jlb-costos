import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { StorageItem } from "@/types/project";
import { StorageHeader } from "@/components/storage/StorageHeader";
import { StorageForm } from "@/components/storage/StorageForm";
import { StorageTable } from "@/components/storage/StorageTable";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export default function GuestDashboard() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        console.log("Loading storage items...");
        
        const { data: supabaseItems, error } = await supabase
          .from('storage_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching storage items from Supabase:", error);
          fallbackToLocalStorage();
          return;
        }
        
        if (supabaseItems && supabaseItems.length > 0) {
          console.log("Storage items loaded from Supabase:", supabaseItems);
          setItems(supabaseItems as StorageItem[]);
          localStorage.setItem("storageItems", JSON.stringify(supabaseItems));
        } else {
          console.log("No storage items found in Supabase, checking localStorage");
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error("Error loading storage items:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fallbackToLocalStorage = () => {
      const savedItems = localStorage.getItem("storageItems");
      const localItems = savedItems ? JSON.parse(savedItems) : [];
      setItems(localItems);
    };
    
    loadItems();
  }, []);

  const handleAddItem = async (newItem: StorageItem) => {
    try {
      if (editingItem) {
        console.log("Updating item:", newItem);
        
        const { error } = await supabase
          .from('storage_items')
          .update({
            categoryName: newItem.categoryName,
            name: newItem.name,
            cost: newItem.cost,
            unit: newItem.unit || null,
            ivaAmount: newItem.ivaAmount || null
          })
          .eq('id', newItem.id);
          
        if (error) {
          console.error("Error updating item in Supabase:", error);
          throw error;
        }
        
        const { data: updatedItems } = await supabase
          .from('storage_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (updatedItems) {
          setItems(updatedItems as StorageItem[]);
          localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        }
        
        setEditingItem(null);
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        });
      } else {
        console.log("Adding new item:", newItem);
        
        const { error } = await supabase
          .from('storage_items')
          .insert({
            id: newItem.id,
            categoryName: newItem.categoryName,
            name: newItem.name,
            cost: newItem.cost,
            unit: newItem.unit || null,
            ivaAmount: newItem.ivaAmount || null
          });
        
        if (error) {
          console.error("Error adding item to Supabase:", error);
          throw error;
        }
        
        const { data: updatedItems } = await supabase
          .from('storage_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (updatedItems) {
          setItems(updatedItems as StorageItem[]);
          localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        }
        
        toast({
          title: "Éxito",
          description: "Item agregado correctamente",
        });
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Error al guardar el item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('storage_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting item from Supabase:", error);
        throw error;
      }
      
      const { data: updatedItems } = await supabase
        .from('storage_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (updatedItems) {
        setItems(updatedItems as StorageItem[]);
        localStorage.setItem("storageItems", JSON.stringify(updatedItems));
      }
      
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: StorageItem) => {
    setEditingItem(item);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 flex justify-center items-center h-[70vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 space-y-8 animate-fadeIn">
        <StorageHeader setItems={setItems} />
        <div className="flex justify-between items-center">
          <StorageForm onAddItem={handleAddItem} editingItem={editingItem} />
        </div>
        <StorageTable
          items={items}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
        />
      </div>
    </div>
  );
}
