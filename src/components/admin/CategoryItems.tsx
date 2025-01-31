import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, Category, StorageItem } from "@/types/project";
import { CategoryItemSelector } from "./category/CategoryItemSelector";
import { CategoryItemInput } from "./category/CategoryItemInput";
import { CategoryItemQuantity } from "./category/CategoryItemQuantity";

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
  const { toast } = useToast();
  const storageItems: StorageItem[] = JSON.parse(
    localStorage.getItem("storageItems") || "[]"
  );

  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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

  const handleItemNameChange = (itemIndex: number, value: string) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].name = value;
    onUpdateProject(newProject);
  };

  return (
    <>
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
              <CategoryItemInput
                name={item.name}
                onChange={(value) => handleItemNameChange(itemIndex, value)}
              />
            )}
            {item.name && category.name === "Insumos" && (
              <CategoryItemQuantity
                quantity={item.quantity || 1}
                unit={item.unit || ""}
                onChange={(value) => handleQuantityChange(itemIndex, value)}
              />
            )}
            {item.cost && item.quantity && (
              <span className="text-sm text-muted-foreground">
                Total: {formatCurrency(item.cost * item.quantity)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteProjectItem(itemIndex)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}