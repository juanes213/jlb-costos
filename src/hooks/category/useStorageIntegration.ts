
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";

export function useStorageIntegration(
  project: Project, 
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const { toast } = useToast();

  const storageItems = JSON.parse(
    localStorage.getItem("storageItems") || "[]"
  );

  const storageCategories = Array.from(
    new Set(storageItems.map((item: any) => item.categoryName))
  );

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
  };
}
