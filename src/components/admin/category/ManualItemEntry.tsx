
import { useState } from "react";
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
}

export function ManualItemEntry({
  item,
  itemIndex,
  onNameChange,
  onUnitChange,
  onCostChange,
  onApply,
  onSaveToStorage
}: ManualItemEntryProps) {
  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex gap-2">
      <Input
        value={item.name || ""}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nombre del item"
        className="w-48 border-blue-200 focus:border-blue-400"
      />
      <Input
        value={item.unit || ""}
        onChange={(e) => onUnitChange(e.target.value)}
        placeholder="Unidad"
        className="w-20 border-blue-200 focus:border-blue-400"
      />
      {onSaveToStorage && (
        <Button 
          onClick={onSaveToStorage} 
          variant="outline" 
          size="sm"
        >
          Guardar en almacén
        </Button>
      )}
      <Button 
        onClick={onApply} 
        variant="default" 
        size="sm"
      >
        Aplicar
      </Button>
    </div>
  );
}
