
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, QuoteFile } from "@/types/project";

export function useItemManagement(
  project: Project,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const { toast } = useToast();

  const handleDeleteProjectItem = (itemIndex: number) => {
    const newProject = { ...project };
    
    if (!Array.isArray(newProject.categories)) {
      console.error("Categories is not an array", newProject.categories);
      return;
    }
    
    if (!Array.isArray(newProject.categories[categoryIndex]?.items)) {
      console.error("Items is not an array", newProject.categories[categoryIndex]);
      return;
    }
    
    newProject.categories[categoryIndex].items = newProject.categories[
      categoryIndex
    ].items.filter((_, index) => index !== itemIndex);
    
    onUpdateProject(newProject);
  };

  const handleAddItem = () => {
    const newProject = { ...project };
    
    // Ensure categories is an array
    if (!Array.isArray(newProject.categories)) {
      if (typeof newProject.categories === 'string') {
        try {
          newProject.categories = JSON.parse(newProject.categories);
        } catch (e) {
          console.error("Failed to parse categories string", e);
          newProject.categories = [];
        }
      } else {
        newProject.categories = [];
      }
    }
    
    // Ensure the category exists
    if (!newProject.categories[categoryIndex]) {
      console.error("Category does not exist at index", categoryIndex);
      return;
    }
    
    // Ensure items is an array
    if (!Array.isArray(newProject.categories[categoryIndex].items)) {
      newProject.categories[categoryIndex].items = [];
    }
    
    // Add the new empty item
    newProject.categories[categoryIndex].items.push({
      id: crypto.randomUUID(),
      name: "",
      cost: 0,
      quantity: 1,
      quotes: []
    });
    
    onUpdateProject(newProject);
    
    toast({
      title: "Item añadido",
      description: "Nuevo item añadido correctamente. Complete los datos y guarde los cambios.",
    });
  };

  const handleQuantityChange = (itemIndex: number, value: string) => {
    const quantity = value === "" ? 0 : parseInt(value, 10);

    const newProject = { ...project };
    const item = newProject.categories[categoryIndex].items[itemIndex];
    item.quantity = isNaN(quantity) ? 0 : quantity;
    onUpdateProject(newProject);
  };

  const handleIvaCalculated = (itemIndex: number, ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const handleQuotesChange = (itemIndex: number, quotes: QuoteFile[]) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].quotes = quotes;
    onUpdateProject(newProject);
  };

  return {
    handleDeleteProjectItem,
    handleAddItem,
    handleQuantityChange,
    handleIvaCalculated,
    handleQuotesChange
  };
}
