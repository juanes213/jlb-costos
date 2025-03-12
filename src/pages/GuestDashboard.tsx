
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { read, utils } from "xlsx";
import type { StorageItem } from "@/types/project";
import { StorageHeader } from "@/components/storage/StorageHeader";
import { StorageForm } from "@/components/storage/StorageForm";
import { StorageTable } from "@/components/storage/StorageTable";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function GuestDashboard() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load storage items from Supabase
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        console.log("Loading storage items...");
        
        // Try to fetch from Supabase
        const { data: supabaseItems, error } = await supabase
          .from('storage_items')
          .select('*');
          
        if (error) {
          console.error("Error fetching storage items from Supabase:", error);
          // Fall back to localStorage
          fallbackToLocalStorage();
          return;
        }
        
        if (supabaseItems && supabaseItems.length > 0) {
          console.log("Storage items loaded from Supabase:", supabaseItems);
          setItems(supabaseItems as StorageItem[]);
          
          // Also update localStorage as backup
          localStorage.setItem("storageItems", JSON.stringify(supabaseItems));
        } else {
          console.log("No storage items found in Supabase, checking localStorage");
          // If no items in Supabase, check localStorage and migrate if needed
          fallbackToLocalStorage(true);
        }
      } catch (error) {
        console.error("Error loading storage items:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fallbackToLocalStorage = async (migrateToSupabase = false) => {
      const savedItems = localStorage.getItem("storageItems");
      const localItems = savedItems ? JSON.parse(savedItems) : [];
      
      console.log("Loading storage items from localStorage:", localItems);
      setItems(localItems);
      
      // Migrate to Supabase if requested and user is admin
      if (migrateToSupabase && localItems.length > 0 && user?.role === 'admin') {
        console.log("Migrating storage items from localStorage to Supabase");
        try {
          for (const item of localItems) {
            const { error } = await supabase.from('storage_items').insert({
              id: item.id,
              categoryName: item.categoryName,
              name: item.name,
              cost: item.cost,
              unit: item.unit || null,
              ivaAmount: item.ivaAmount || null,
              created_at: new Date().toISOString()
            });
            
            if (error) {
              console.error("Error migrating item to Supabase:", error, item);
            }
          }
          console.log("Storage items migrated from localStorage to Supabase");
        } catch (error) {
          console.error("Error migrating storage items to Supabase:", error);
        }
      }
    };
    
    loadItems();
  }, [user]);

  const handleAddItem = async (newItem: StorageItem) => {
    try {
      if (editingItem) {
        // Update existing item
        console.log("Updating item:", newItem);
        const updatedItems = items.map(item => 
          item.id === editingItem.id ? newItem : item
        );
        
        // Update in Supabase
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
          console.error("Error updating item in Supabase:", error, newItem);
          toast({
            title: "Error",
            description: "Error al actualizar el item en la base de datos",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Éxito",
            description: "Item actualizado correctamente",
          });
        }
        
        setItems(updatedItems);
        localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        setEditingItem(null);
      } else {
        // Add new item
        console.log("Adding new item:", newItem);
        const updatedItems = [...items, newItem];
        
        // Add to Supabase
        const { error } = await supabase.from('storage_items').insert({
          id: newItem.id,
          categoryName: newItem.categoryName,
          name: newItem.name,
          cost: newItem.cost,
          unit: newItem.unit || null,
          ivaAmount: newItem.ivaAmount || null,
          created_at: new Date().toISOString()
        });
        
        if (error) {
          console.error("Error adding item to Supabase:", error, newItem);
          toast({
            title: "Error",
            description: "Error al guardar el item en la base de datos",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Éxito",
            description: "Item agregado correctamente",
          });
        }
        
        setItems(updatedItems);
        localStorage.setItem("storageItems", JSON.stringify(updatedItems));
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
      console.log("Deleting item:", id);
      const updatedItems = items.filter(item => item.id !== id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('storage_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting item from Supabase:", error);
        toast({
          title: "Error",
          description: "Error al eliminar el item de la base de datos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Item eliminado correctamente",
        });
      }
      
      setItems(updatedItems);
      localStorage.setItem("storageItems", JSON.stringify(updatedItems));
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
