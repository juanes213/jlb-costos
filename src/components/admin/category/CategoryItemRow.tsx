
import { useState } from "react";
import type { Item, StorageItem } from "@/types/project";
import { CategoryItemSelector } from "./CategoryItemSelector";
import { CategoryItemQuantity } from "./CategoryItemQuantity";
import { CategoryItemCosts } from "./CategoryItemCosts";
import { CategoryItemActions } from "./CategoryItemActions";
import { ManualItemEntry } from "./ManualItemEntry";
import { ItemCostEditor } from "./ItemCostEditor";

interface CategoryItemRowProps {
  item: Item;
  itemIndex: number;
  isStorageCategory: boolean;
  storageItems: StorageItem[];
  manualEntryMode: boolean;
  editedItem: {
    name: string;
    cost: number;
    unit: string;
  };
  categoryName: string;
  onItemSelect: (itemIndex: number, storageItemId: string) => void;
  onManualSelect: (itemIndex: number) => void;
  onQuantityChange: (itemIndex: number, value: string) => void;
  onNameChange: (itemIndex: number, value: string) => void;
  onUnitChange: (itemIndex: number, value: string) => void;
  onCostChange: (itemIndex: number, value: string) => void;
  onApplyChanges: (itemIndex: number) => void;
  onIvaCalculated: (itemIndex: number, amount: number | undefined) => void;
  onSaveToStorage: (itemIndex: number) => void;
  onDelete: (itemIndex: number) => void;
  isLoading?: boolean;
}

export function CategoryItemRow({
  item,
  itemIndex,
  isStorageCategory,
  storageItems,
  manualEntryMode,
  editedItem,
  categoryName,
  onItemSelect,
  onManualSelect,
  onQuantityChange,
  onNameChange,
  onUnitChange,
  onCostChange,
  onApplyChanges,
  onIvaCalculated,
  onSaveToStorage,
  onDelete,
  isLoading = false
}: CategoryItemRowProps) {
  // Only show unit for "Insumos" category
  const shouldShowUnit = categoryName === "Insumos";
  
  return (
    <div className="flex items-center justify-between ml-4 flex-wrap gap-2">
      <div className="flex items-center gap-2 flex-1">
        {isStorageCategory ? (
          manualEntryMode ? (
            <ManualItemEntry 
              item={editedItem}
              itemIndex={itemIndex}
              onNameChange={(value) => onNameChange(itemIndex, value)}
              onUnitChange={(value) => onUnitChange(itemIndex, value)}
              onCostChange={(value) => onCostChange(itemIndex, value)}
              onApply={() => onApplyChanges(itemIndex)}
              onSaveToStorage={() => {
                onApplyChanges(itemIndex);
                onSaveToStorage(itemIndex);
              }}
              shouldShowUnit={shouldShowUnit}
            />
          ) : (
            <CategoryItemSelector
              storageItems={storageItems}
              selectedItemName={item.name}
              onItemSelect={(value) => onItemSelect(itemIndex, value)}
              onManualSelect={() => onManualSelect(itemIndex)}
              categoryName={categoryName}
              isLoading={isLoading}
            />
          )
        ) : (
          <div className="flex gap-2">
            <ManualItemEntry 
              item={{...item, ...editedItem}}
              itemIndex={itemIndex}
              onNameChange={(value) => onNameChange(itemIndex, value)}
              onUnitChange={(value) => onUnitChange(itemIndex, value)}
              onCostChange={(value) => onCostChange(itemIndex, value)}
              onApply={() => onApplyChanges(itemIndex)}
              shouldShowUnit={shouldShowUnit}
            />
          </div>
        )}
        <CategoryItemQuantity
          quantity={item.quantity || 1}
          unit={shouldShowUnit ? (item.unit || "") : ""}
          onChange={(value) => onQuantityChange(itemIndex, value)}
        />
        
        {(!isStorageCategory || manualEntryMode) && (
          <ItemCostEditor
            cost={editedItem.cost || item.cost}
            onChange={(value) => onCostChange(itemIndex, value)}
            onApply={() => onApplyChanges(itemIndex)}
          />
        )}
        
        {item.cost !== undefined && (
          <CategoryItemCosts
            cost={item.cost}
            quantity={item.quantity || 1}
            ivaAmount={item.ivaAmount}
            onIvaCalculated={(amount) => onIvaCalculated(itemIndex, amount)}
          />
        )}
      </div>
      <CategoryItemActions onDelete={() => onDelete(itemIndex)} />
    </div>
  );
}
