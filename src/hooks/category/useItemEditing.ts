
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, StorageItem } from "@/types/project";

export function useItemEditing(
  project: Project,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const [manualEntryMode, setManualEntryMode] = useState<Record<number, boolean>>({});
  const [editedItems, setEditedItems] = useState<
    Record<number, { name: string; cost: number; unit: string }>
  >({});
  const { toast } = useToast();

  const handleManualSelect = (itemIndex: number) => {
    setManualEntryMode((prev) => ({
      ...prev,
      [itemIndex]: true,
    }));

    // Initialize the edited item with current values
    const currentItem = project.categories[categoryIndex].items[itemIndex];
    setEditedItems((prev) => ({
      ...prev,
      [itemIndex]: {
        name: currentItem?.name || "",
        cost: currentItem?.cost || 0,
        unit: currentItem?.unit || "",
      },
    }));
  };

  const handleItemSelect = (itemIndex: number, storageItemId: string, storageItems: StorageItem[]) => {
    const selectedItem = storageItems.find((item) => item.id === storageItemId);
    if (!selectedItem) return;

    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex] = {
      ...newProject.categories[categoryIndex].items[itemIndex],
      name: selectedItem.name,
      cost: selectedItem.cost,
      quantity: 1,
      unit: selectedItem.unit,
      ivaAmount: selectedItem.ivaAmount,
    };
    onUpdateProject(newProject);
  };

  const handleItemNameChange = (itemIndex: number, value: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        name: value,
      },
    }));
  };

  const handleItemCostChange = (itemIndex: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cost = parseFloat(numericValue) || 0;

    setEditedItems((prev) => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        cost: cost,
      },
    }));
  };

  const handleItemUnitChange = (itemIndex: number, value: string) => {
    setEditedItems((prev) => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        unit: value,
      },
    }));
  };

  const handleApplyManualChanges = (itemIndex: number) => {
    if (!editedItems[itemIndex]) return;

    const newProject = { ...project };
    
    // Ensure the item exists in the project
    if (!newProject.categories[categoryIndex].items[itemIndex]) {
      console.error("Tried to update non-existent item");
      return;
    }
    
    newProject.categories[categoryIndex].items[itemIndex] = {
      ...newProject.categories[categoryIndex].items[itemIndex],
      name: editedItems[itemIndex].name,
      cost: editedItems[itemIndex].cost,
      unit: editedItems[itemIndex].unit,
    };

    onUpdateProject(newProject);
    
    // Show success notification
    toast({
      title: "Cambios aplicados",
      description: "Los cambios han sido aplicados correctamente",
    });
  };

  // New function to exit manual entry mode
  const handleCompleteManualEntry = (itemIndex: number) => {
    setManualEntryMode((prev) => ({
      ...prev,
      [itemIndex]: false,
    }));
    
    toast({
      title: "Item guardado",
      description: "El item ha sido guardado correctamente",
    });
  };

  return {
    manualEntryMode,
    editedItems,
    handleManualSelect,
    handleItemSelect,
    handleItemNameChange,
    handleItemCostChange,
    handleItemUnitChange,
    handleApplyManualChanges,
    handleCompleteManualEntry,
  };
}
