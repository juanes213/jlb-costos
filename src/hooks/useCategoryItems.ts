
import { useBaseCost } from "./category/useBaseCost";
import { useItemManagement } from "./category/useItemManagement";
import { useItemEditing } from "./category/useItemEditing";
import { useStorageIntegration } from "./category/useStorageIntegration";
import { useToast } from "@/hooks/use-toast";
import type { Project, Category, StorageItem } from "@/types/project";

export function useCategoryItems(
  project: Project,
  category: Category,
  categoryIndex: number,
  onUpdateProject: (project: Project) => void
) {
  const { toast } = useToast();
  
  // Import functionality from smaller, focused hooks
  const { categoryBaseCost, handleCategoryBaseCostChange } = useBaseCost(
    project,
    categoryIndex,
    onUpdateProject
  );
  
  const { 
    handleDeleteProjectItem,
    handleAddItem,
    handleQuantityChange,
    handleIvaCalculated
  } = useItemManagement(
    project,
    categoryIndex,
    onUpdateProject
  );
  
  const {
    manualEntryMode,
    editedItems,
    handleManualSelect,
    handleItemSelect,
    handleItemNameChange,
    handleItemCostChange,
    handleItemUnitChange,
    handleApplyManualChanges,
    handleCompleteManualEntry
  } = useItemEditing(
    project,
    categoryIndex,
    onUpdateProject
  );
  
  const {
    storageItems,
    storageCategories,
    handleSaveToStorage,
    isLoading
  } = useStorageIntegration(
    project,
    categoryIndex, 
    onUpdateProject
  );

  // Enhanced save function with toast notifications
  const handleSaveWithNotification = (itemIndex: number) => {
    handleSaveToStorage(itemIndex);
    toast({
      title: "Elemento guardado",
      description: `El elemento ha sido guardado en almacén y en el proyecto.`,
    });
  };

  // Adapter for the old interface that requires storageItems param
  const itemSelectAdapter = (itemIndex: number, storageItemId: string) => {
    handleItemSelect(itemIndex, storageItemId, storageItems);
  };

  return {
    categoryBaseCost,
    manualEntryMode,
    editedItems,
    storageItems,
    storageCategories,
    handleDeleteProjectItem,
    handleItemSelect: itemSelectAdapter,
    handleManualSelect,
    handleQuantityChange,
    handleCategoryBaseCostChange,
    handleItemNameChange,
    handleItemCostChange,
    handleItemUnitChange,
    handleApplyManualChanges,
    handleIvaCalculated,
    handleSaveToStorage: handleSaveWithNotification,
    handleAddItem,
    handleCompleteManualEntry,
    isLoading,
  };
}
