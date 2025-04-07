
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Project, Category, StorageItem, Item } from "@/types/project";

export function useCategoryItems(
  project: Project,
  category: Category,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const [categoryBaseCost, setCategoryBaseCost] = useState<string>(
    category.cost?.toString() || ""
  );
  const [manualEntryMode, setManualEntryMode] = useState<Record<number, boolean>>({});
  const [editedItems, setEditedItems] = useState<
    Record<number, { name: string; cost: number; unit: string }>
  >({});
  const { toast } = useToast();

  const storageItems: StorageItem[] = JSON.parse(
    localStorage.getItem("storageItems") || "[]"
  );

  const storageCategories = Array.from(
    new Set(storageItems.map((item) => item.categoryName))
  );

  const handleDeleteProjectItem = (itemIndex: number) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[
      categoryIndex
    ].items.filter((_, index) => index !== itemIndex);
    onUpdateProject(newProject);
  };

  const handleItemSelect = (itemIndex: number, storageItemId: string) => {
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

  const handleQuantityChange = (itemIndex: number, value: string) => {
    const quantity = value === "" ? 0 : parseInt(value, 10);

    const newProject = { ...project };
    const item = newProject.categories[categoryIndex].items[itemIndex];
    item.quantity = isNaN(quantity) ? 0 : quantity;
    onUpdateProject(newProject);
  };

  const handleCategoryBaseCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCategoryBaseCost(numericValue);

    const newProject = { ...project };
    newProject.categories[categoryIndex].cost = parseFloat(numericValue) || 0;
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

  const handleIvaCalculated = (itemIndex: number, ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const handleSaveToStorage = async (itemIndex: number) => {
    // First apply any pending changes to the project
    handleApplyManualChanges(itemIndex);

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
        categoryName: category.name,
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

      // Update the item in the project to no longer be in manual entry mode
      setManualEntryMode((prev) => ({
        ...prev,
        [itemIndex]: false,
      }));

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

  const handleAddItem = () => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items.push({
      name: "",
      cost: 0,
      quantity: 1,
    });
    onUpdateProject(newProject);
  };

  return {
    categoryBaseCost,
    manualEntryMode,
    editedItems,
    storageItems,
    storageCategories,
    handleDeleteProjectItem,
    handleItemSelect,
    handleManualSelect,
    handleQuantityChange,
    handleCategoryBaseCostChange,
    handleItemNameChange,
    handleItemCostChange,
    handleItemUnitChange,
    handleApplyManualChanges,
    handleIvaCalculated,
    handleSaveToStorage,
    handleAddItem,
  };
}
