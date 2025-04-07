
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";

export function useItemManagement(
  project: Project,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const { toast } = useToast();

  const handleDeleteProjectItem = (itemIndex: number) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[
      categoryIndex
    ].items.filter((_, index) => index !== itemIndex);
    onUpdateProject(newProject);
  };

  const handleAddItem = () => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items.push({
      name: "",
      cost: 0,
      quantity: 1,
    });
    onUpdateProject(newProject);
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

  return {
    handleDeleteProjectItem,
    handleAddItem,
    handleQuantityChange,
    handleIvaCalculated
  };
}
