
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StorageItem } from "@/types/project";

interface StorageFormProps {
  onAddItem: (item: StorageItem) => void;
  editingItem?: StorageItem | null;
}

export function StorageForm({ onAddItem, editingItem }: StorageFormProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [categoryName, setCategoryName] = useState("Insumos");
  const { toast } = useToast();

  const categories = ["Insumos", "Transporte", "Viáticos", "Imprevistos"];

  useEffect(() => {
    if (editingItem) {
      setNewItemName(editingItem.name);
      setNewItemCost(editingItem.cost.toString());
      setNewItemUnit(editingItem.unit || "");
      setCategoryName(editingItem.categoryName);
    }
  }, [editingItem]);

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

  const handleSubmit = () => {
    if (!newItemName || !newItemCost || !categoryName) {
      toast({
        title: "Error",
        description: "Por favor complete al menos el nombre, categoría y costo",
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

    const item: StorageItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      categoryName: categoryName,
      name: newItemName,
      cost: numericCost,
      unit: newItemUnit || "",
    };

    onAddItem(item);

    // Reset form
    setNewItemName("");
    setNewItemCost("");
    setNewItemUnit("");
    setCategoryName("Insumos");
  };

  return (
    <Card className="p-6 space-y-6 bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={categoryName}
          onValueChange={setCategoryName}
        >
          <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          placeholder="Unidad (opcional)"
          value={newItemUnit}
          onChange={(e) => setNewItemUnit(e.target.value)}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        {editingItem ? "Actualizar Item" : "Agregar Item"}
      </Button>
    </Card>
  );
}
