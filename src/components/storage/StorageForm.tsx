
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { StorageItem } from "@/types/project";

interface StorageFormProps {
  onAddItem: (item: StorageItem) => void;
}

export function StorageForm({ onAddItem }: StorageFormProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const { toast } = useToast();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(numericValue) || 0);
  };

  const handleCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setNewItemCost(numericValue);
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemCost || !newItemUnit) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const numericCost = parseFloat(newItemCost);
    
    if (isNaN(numericCost)) {
      toast({
        title: "Error",
        description: "El costo debe ser un número válido",
        variant: "destructive",
      });
      return;
    }

    const newItem: StorageItem = {
      id: crypto.randomUUID(),
      categoryName: "Insumos",
      name: newItemName,
      cost: numericCost,
      unit: newItemUnit,
    };

    onAddItem(newItem);

    setNewItemName("");
    setNewItemCost("");
    setNewItemUnit("");

    toast({
      title: "Éxito",
      description: "Item agregado correctamente",
    });
  };

  return (
    <Card className="p-6 space-y-6 bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Nombre del item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="border-blue-200 focus:border-blue-400"
        />
        <Input
          placeholder="Costo"
          value={newItemCost ? formatCurrency(newItemCost) : ""}
          onChange={(e) => handleCostChange(e.target.value)}
          className="border-blue-200 focus:border-blue-400"
        />
        <Input
          placeholder="Unidad (ej: kg, l, unidad)"
          value={newItemUnit}
          onChange={(e) => setNewItemUnit(e.target.value)}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>
      <Button onClick={handleAddItem} className="w-full">
        Agregar Item
      </Button>
    </Card>
  );
}
