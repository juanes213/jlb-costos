
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { Item } from "@/types/project";

interface ManualItemEntryProps {
  item: Item;
  itemIndex: number;
  onNameChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onApply: () => void;
  onSaveToStorage?: () => void;
  shouldShowUnit?: boolean;
  onComplete?: () => void;
}

export function ManualItemEntry({
  item,
  itemIndex,
  onNameChange,
  onUnitChange,
  onCostChange,
  onApply,
  onSaveToStorage,
  shouldShowUnit = false,
  onComplete
}: ManualItemEntryProps) {
  const [originalItem, setOriginalItem] = useState({
    name: item.name || "",
    unit: item.unit || "", 
    cost: item.cost || 0
  });
  const [isChanged, setIsChanged] = useState(false);
  
  useEffect(() => {
    setOriginalItem({
      name: item.name || "",
      unit: item.unit || "",
      cost: item.cost || 0
    });
    setIsChanged(false);
  }, [item]);
  
  const checkIfChanged = (newItem: {name?: string, unit?: string, cost?: number}) => {
    return newItem.name !== originalItem.name || 
           newItem.unit !== originalItem.unit || 
           newItem.cost !== originalItem.cost;
  };
  
  const handleNameChange = (value: string) => {
    onNameChange(value);
    setIsChanged(checkIfChanged({...originalItem, name: value}));
  };
  
  const handleUnitChange = (value: string) => {
    onUnitChange(value);
    setIsChanged(checkIfChanged({...originalItem, unit: value}));
  };
  
  const handleCostChange = (value: string) => {
    onCostChange(value);
    const numericValue = value.replace(/\D/g, "");
    const newCost = parseFloat(numericValue) || 0;
    setIsChanged(checkIfChanged({...originalItem, cost: newCost}));
  };

  // Handle form submission and save to both project and storage
  const handleSave = () => {
    onApply();
    if (onSaveToStorage) {
      onSaveToStorage();
    }
    setIsChanged(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Added form submission on enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isChanged) {
      handleSave();
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Input
        value={item.name || ""}
        onChange={(e) => handleNameChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nombre del item"
        className="w-48 border-blue-200 focus:border-blue-400"
      />
      {shouldShowUnit && (
        <Input
          value={item.unit || ""}
          onChange={(e) => handleUnitChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Unidad"
          className="w-20 border-blue-200 focus:border-blue-400"
        />
      )}
      <Button 
        onClick={handleSave} 
        variant="default" 
        size="sm"
        className="flex gap-2 items-center"
      >
        <Save className="w-4 h-4" />
        Guardar
      </Button>
    </div>
  );
}
