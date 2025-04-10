
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Project, StorageItem } from "@/types/project";

export function useStorageIntegration(
  project: Project, 
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const { toast } = useToast();
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [storageCategories, setStorageCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load storage items on component mount
  useEffect(() => {
    const fetchStorageItems = async () => {
      try {
        setIsLoading(true);
        
        // First try to get data from Supabase
        const { data, error } = await supabase
          .from("storage_items")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching storage items:", error);
          fallbackToLocalStorage();
          return;
        }
        
        if (data && data.length > 0) {
          const mappedItems = data.map((item) => ({
            id: item.id,
            categoryName: item.categoryName,
            name: item.name,
            cost: item.cost,
            unit: item.unit || "",
            ivaAmount: item.ivaAmount || undefined,
          }));
          
          setStorageItems(mappedItems);
          const categories = Array.from(
            new Set(mappedItems.map((item) => item.categoryName))
          );
          setStorageCategories(categories);
          
          // Update local storage with fresh data
          localStorage.setItem("storageItems", JSON.stringify(mappedItems));
          console.log("Storage items loaded from Supabase:", mappedItems.length);
        } else {
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error("Error in fetchStorageItems:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fallbackToLocalStorage = () => {
      console.log("Falling back to localStorage for storage items");
      const storedItems = localStorage.getItem("storageItems");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setStorageItems(parsedItems);
        const categories = Array.from(
          new Set(parsedItems.map((item: StorageItem) => item.categoryName))
        );
        setStorageCategories(categories);
      } else {
        setStorageItems([]);
        setStorageCategories([]);
      }
    };
    
    fetchStorageItems();
  }, []);

  const handleSaveToStorage = async (itemIndex: number) => {
    const item = project.categories[categoryIndex].items[itemIndex];
    if (!item.name || !item.cost) {
      toast({
        title: "Error",
        description: "El nombre y el costo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("storage_items").insert({
        categoryName: project.categories[categoryIndex].name,
        name: item.name,
        cost: item.cost,
        unit: item.unit || null,
        ivaAmount: item.ivaAmount || null,
      });

      if (error) {
        console.error("Error adding item to storage:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar el item en el almacén",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Item guardado en el almacén correctamente",
      });

      // Refresh storage items
      const { data: updatedItems } = await supabase
        .from("storage_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (updatedItems) {
        const mappedItems = updatedItems.map((item) => ({
          id: item.id,
          categoryName: item.categoryName,
          name: item.name,
          cost: item.cost,
          unit: item.unit || "",
          ivaAmount: item.ivaAmount || undefined,
        }));
        
        setStorageItems(mappedItems);
        const categories = Array.from(
          new Set(mappedItems.map((item) => item.categoryName))
        );
        setStorageCategories(categories);
        
        localStorage.setItem("storageItems", JSON.stringify(mappedItems));
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el item",
        variant: "destructive",
      });
    }
  };

  return {
    storageItems,
    storageCategories,
    handleSaveToStorage,
    isLoading
  };
}
