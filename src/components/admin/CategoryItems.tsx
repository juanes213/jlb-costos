
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Project, Category, StorageItem } from "@/types/project";
import { CategoryItemSelector } from "./category/CategoryItemSelector";
import { CategoryItemQuantity } from "./category/CategoryItemQuantity";
import { CategoryBaseCost } from "./category/CategoryBaseCost";
import { CategoryItemCosts } from "./category/CategoryItemCosts";
import { CategoryItemActions } from "./category/CategoryItemActions";

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
  const [categoryBaseCost, setCategoryBaseCost] = useState<string>(category.cost?.toString() || "");
  const storageItems: StorageItem[] = JSON.parse(
    localStorage.getItem("storageItems") || "[]"
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
      ivaAmount: selectedItem.ivaAmount
    };
    onUpdateProject(newProject);
  };

  const handleQuantityChange = (itemIndex: number, value: string) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;

    const newProject = { ...project };
    const item = newProject.categories[categoryIndex].items[itemIndex];
    item.quantity = quantity;
    onUpdateProject(newProject);
  };

  const handleIvaCalculated = (itemIndex: number, ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const handleAddItem = () => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items.push({
      name: "",
      cost: 0,
      quantity: 1
    });
    onUpdateProject(newProject);
  };

  return (
    <div className="space-y-4">
      {category.items.length === 0 && (
        <CategoryBaseCost
          categoryBaseCost={categoryBaseCost}
          onBaseCostChange={handleCategoryBaseCostChange}
        />
      )}

      {category.items.map((item, itemIndex) => (
        <div
          key={itemIndex}
          className="flex items-center justify-between ml-4 flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 flex-1">
            {category.name === "Insumos" ? (
              <CategoryItemSelector
                storageItems={storageItems}
                selectedItemName={item.name}
                onItemSelect={(value) => handleItemSelect(itemIndex, value)}
              />
            ) : (
              <Input
                value={item.name}
                onChange={(e) => {
                  const newProject = { ...project };
                  newProject.categories[categoryIndex].items[itemIndex].name = e.target.value;
                  onUpdateProject(newProject);
                }}
                placeholder="Nombre del item"
                className="w-48 border-blue-200 focus:border-blue-400"
              />
            )}
            <CategoryItemQuantity
              quantity={item.quantity || 1}
              unit={item.unit || ""}
              onChange={(value) => handleQuantityChange(itemIndex, value)}
            />
            {item.cost && (
              <CategoryItemCosts
                cost={item.cost}
                quantity={item.quantity || 1}
                ivaAmount={item.ivaAmount}
                onIvaCalculated={(amount) => handleIvaCalculated(itemIndex, amount)}
              />
            )}
          </div>
          <CategoryItemActions
            onDelete={() => handleDeleteProjectItem(itemIndex)}
          />
        </div>
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
