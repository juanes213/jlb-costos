
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
          setItems(supabaseItems as StorageItem[]);
          console.log("Storage items loaded from Supabase:", supabaseItems);
        } else {
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
      
      setItems(localItems);
      
      // Migrate to Supabase if requested and user is admin
      if (migrateToSupabase && localItems.length > 0 && user?.role === 'admin') {
        try {
          for (const item of localItems) {
            await supabase.from('storage_items').insert({
              id: item.id,
              categoryName: item.categoryName,
              name: item.name,
              cost: item.cost,
              unit: item.unit || null,
              ivaAmount: item.ivaAmount || null,
              created_at: new Date().toISOString()
            });
          }
          console.log("Storage items migrated from localStorage to Supabase");
        } catch (error) {
          console.error("Error migrating storage items to Supabase:", error);
        }
      }
    };
    
    loadItems();
  }, [user]);

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

      // Save to Supabase and update state
      if (user) {
        for (const item of newItems) {
          await supabase.from('storage_items').insert({
            id: item.id,
            categoryName: item.categoryName,
            name: item.name,
            cost: item.cost,
            unit: item.unit || null,
            ivaAmount: item.ivaAmount || null,
            created_at: new Date().toISOString()
          });
        }
      }
      
      setItems(newItems);
      
      // Also save to localStorage as fallback
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

  const handleAddItem = async (newItem: StorageItem) => {
    try {
      if (editingItem) {
        // Update existing item
        const updatedItems = items.map(item => 
          item.id === editingItem.id ? newItem : item
        );
        
        // Update in Supabase
        if (user) {
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
          }
        }
        
        setItems(updatedItems);
        localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        setEditingItem(null);
        
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        });
      } else {
        // Add new item
        const updatedItems = [...items, newItem];
        
        // Add to Supabase
        if (user) {
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
            console.error("Error adding item to Supabase:", error);
          }
        }
        
        setItems(updatedItems);
        localStorage.setItem("storageItems", JSON.stringify(updatedItems));
        
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
      const updatedItems = items.filter(item => item.id !== id);
      
      // Delete from Supabase
      if (user) {
        const { error } = await supabase
          .from('storage_items')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Error deleting item from Supabase:", error);
        }
      }
      
      setItems(updatedItems);
      localStorage.setItem("storageItems", JSON.stringify(updatedItems));

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
