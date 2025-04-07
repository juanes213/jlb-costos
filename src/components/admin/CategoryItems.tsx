
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project, Category } from "@/types/project";
import { CategoryBaseCost } from "./category/CategoryBaseCost";
import { CategoryItemRow } from "./category/CategoryItemRow";
import { useCategoryItems } from "@/hooks/useCategoryItems";

interface CategoryItemsProps {
  project: Project;
  category: Category;
  categoryIndex: number;
  onUpdateProject: (project: Project) => void;
}

export function CategoryItems({
  project,
  category,
  categoryIndex,
  onUpdateProject,
}: CategoryItemsProps) {
  const {
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
  } = useCategoryItems(project, category, categoryIndex, onUpdateProject);

  // Skip rendering for Personal category as it's now handled separately
  if (category.name === "Personal") {
    return null;
  }

  const isStorageCategory = storageCategories.includes(category.name);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <CategoryBaseCost
          categoryBaseCost={categoryBaseCost}
          onBaseCostChange={handleCategoryBaseCostChange}
        />
      </div>

      {category.items.map((item, itemIndex) => (
        <CategoryItemRow
          key={itemIndex}
          item={item}
          itemIndex={itemIndex}
          isStorageCategory={isStorageCategory}
          storageItems={storageItems.filter(si => si.categoryName === category.name)}
          manualEntryMode={manualEntryMode[itemIndex] || false}
          editedItem={editedItems[itemIndex] || { name: item.name, cost: item.cost, unit: item.unit || "" }}
          categoryName={category.name}
          onItemSelect={handleItemSelect}
          onManualSelect={handleManualSelect}
          onQuantityChange={handleQuantityChange}
          onNameChange={handleItemNameChange}
          onUnitChange={handleItemUnitChange}
          onCostChange={handleItemCostChange}
          onApplyChanges={handleApplyManualChanges}
          onIvaCalculated={handleIvaCalculated}
          onSaveToStorage={handleSaveToStorage}
          onDelete={handleDeleteProjectItem}
        />
      ))}
      
      <Button
        onClick={handleAddItem}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir item
      </Button>
    </div>
  );
}
