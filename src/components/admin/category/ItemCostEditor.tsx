
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ItemCostEditorProps {
  cost: number;
  onChange: (value: string) => void;
  onApply: () => void;
}

export function ItemCostEditor({ cost, onChange, onApply }: ItemCostEditorProps) {
  const [originalCost, setOriginalCost] = useState(cost);
  const [isChanged, setIsChanged] = useState(false);
  
  useEffect(() => {
    setOriginalCost(cost);
    setIsChanged(false);
  }, [cost]);
  
  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const handleChange = (value: string) => {
    onChange(value);
    
    // Check if cost has been changed
    const numericValue = value.replace(/\D/g, "");
    const newCost = parseFloat(numericValue) || 0;
    setIsChanged(newCost !== originalCost);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Costo:</label>
      <Input
        type="text"
        value={formatCurrency(cost)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Costo del item"
        className="w-40 border-blue-200 focus:border-blue-400"
      />
      {isChanged && (
        <Button 
          onClick={() => {
            onApply();
            setIsChanged(false);
          }} 
          variant="default" 
          size="sm"
        >
          Aplicar
        </Button>
      )}
    </div>
  );
}
