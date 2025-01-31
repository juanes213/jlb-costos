import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogOut, Trash, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StorageItem } from "@/types/project";

export default function GuestDashboard() {
  const [items, setItems] = useState<StorageItem[]>(() => {
    const savedItems = localStorage.getItem("storageItems");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [newCategory, setNewCategory] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddItem = () => {
    if (!newCategory || !newItemName || !newItemCost || !newItemUnit) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const numericCost = parseFloat(newItemCost.replace(/[^0-9]/g, ""));
    
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
      categoryName: newCategory,
      name: newItemName,
      cost: numericCost,
      unit: newItemUnit,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("storageItems", JSON.stringify(updatedItems));

    setNewCategory("");
    setNewItemName("");
    setNewItemCost("");
    setNewItemUnit("");

    toast({
      title: "Éxito",
      description: "Item agregado correctamente",
    });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem("storageItems", JSON.stringify(updatedItems));

    toast({
      title: "Éxito",
      description: "Item eliminado correctamente",
    });
  };

  const handleEditItem = (item: StorageItem) => {
    setEditingItem(item);
    setNewCategory(item.categoryName);
    setNewItemName(item.name);
    setNewItemCost(item.cost.toString());
    setNewItemUnit(item.unit);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const numericCost = parseFloat(newItemCost.replace(/[^0-9]/g, ""));
    
    if (isNaN(numericCost)) {
      toast({
        title: "Error",
        description: "El costo debe ser un número válido",
        variant: "destructive",
      });
      return;
    }

    const updatedItems = items.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            categoryName: newCategory,
            name: newItemName,
            cost: numericCost,
            unit: newItemUnit,
          }
        : item
    );

    setItems(updatedItems);
    localStorage.setItem("storageItems", JSON.stringify(updatedItems));

    setEditingItem(null);
    setNewCategory("");
    setNewItemName("");
    setNewItemCost("");
    setNewItemUnit("");

    toast({
      title: "Éxito",
      description: "Item actualizado correctamente",
    });
  };

  const handleCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setNewItemCost(numericValue);
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">Gestión de Almacén</h1>
          <p className="text-muted-foreground">
            Agregue y gestione items y categorías
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/login")}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>

      <Card className="p-6 space-y-6 bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Nombre de la categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
          <Input
            placeholder="Nombre del item"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
          <Input
            placeholder="Costo"
            value={newItemCost ? formatCurrency(parseInt(newItemCost)) : ""}
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
        {editingItem ? (
          <div className="flex gap-2">
            <Button onClick={handleUpdateItem} className="flex-1">
              Actualizar Item
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingItem(null);
                setNewCategory("");
                setNewItemName("");
                setNewItemCost("");
                setNewItemUnit("");
              }}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button onClick={handleAddItem} className="w-full">
            Agregar Item
          </Button>
        )}
      </Card>

      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Items en Almacén</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{formatCurrency(item.cost)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}