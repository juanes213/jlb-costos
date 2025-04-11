
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
}

export function ManualItemEntry({
  item,
  itemIndex,
  onNameChange,
  onUnitChange,
  onCostChange,
  onApply,
  onSaveToStorage,
  shouldShowUnit = false
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

  // Added form submission on enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isChanged) {
      onApply();
      setIsChanged(false);
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
        onClick={() => {
          onApply();
          setIsChanged(false);
        }} 
        variant="default" 
        size="sm"
      >
        {isChanged ? "Aplicar" : "Guardar"}
      </Button>
      {onSaveToStorage && (
        <Button 
          onClick={() => {
            onSaveToStorage();
            setIsChanged(false);
          }} 
          variant="outline" 
          size="sm"
        >
          Guardar en almacén
        </Button>
      )}
    </div>
  );
}
