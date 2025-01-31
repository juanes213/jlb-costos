import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, Category, StorageItem } from "@/types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryItemsProps {
  project: Project;
  category: Category;
  categoryIndex: number;
  onUpdateProject: (project: Project) => void;
}

export function CategoryItems({ project, category, categoryIndex, onUpdateProject }: CategoryItemsProps) {
  const [editingItem, setEditingItem] = useState<{itemIndex: number} | null>(null);
  const [editedItemName, setEditedItemName] = useState("");
  const { toast } = useToast();

  const storageItems: StorageItem[] = JSON.parse(localStorage.getItem("storageItems") || "[]");

  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveItemEdit = () => {
    if (!editingItem) return;

    const newProject = { ...project };
    newProject.categories[categoryIndex].items[editingItem.itemIndex].name = editedItemName;
    onUpdateProject(newProject);

    setEditingItem(null);
    setEditedItemName("");

    toast({
      title: "Éxito",
      description: "Elemento actualizado con éxito",
    });
  };

  const handleDeleteProjectItem = (itemIndex: number) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    onUpdateProject(newProject);
  };

  const handleItemSelect = (itemIndex: number, storageItemId: string) => {
    const selectedItem = storageItems.find(item => item.id === storageItemId);
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

  return (
    <>
      {category.items.map((item, itemIndex) => (
        <div key={itemIndex} className="flex items-center justify-between ml-4 flex-wrap gap-2">
          {editingItem?.itemIndex === itemIndex ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedItemName}
                onChange={(e) => setEditedItemName(e.target.value)}
                className="w-48 border-blue-200 focus:border-blue-400"
              />
              <Button onClick={handleSaveItemEdit} size="sm">Save</Button>
              <Button 
                onClick={() => setEditingItem(null)} 
                variant="outline" 
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              {category.name === "Insumos" ? (
                <Select
                  value={item.name}
                  onValueChange={(value) => handleItemSelect(itemIndex, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar item" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageItems
                      .filter(si => si.categoryName === category.name)
                      .map((si) => (
                        <SelectItem key={si.id} value={si.id}>
                          {si.name} - {formatCurrency(si.cost)} ({si.unit})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={item.name}
                  onChange={(e) => {
                    const newProject = { ...project };
                    newProject.categories[categoryIndex].items[itemIndex].name = e.target.value;
                    onUpdateProject(newProject);
                  }}
                  className="w-48 border-blue-200 focus:border-blue-400"
                  placeholder="Nombre del item"
                />
              )}
              {item.name && category.name === "Insumos" && (
                <>
                  <Input
                    type="number"
                    value={item.quantity || 1}
                    onChange={(e) => handleQuantityChange(itemIndex, e.target.value)}
                    className="w-20 border-blue-200 focus:border-blue-400"
                    min="1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.unit}
                  </span>
                </>
              )}
              {item.cost && item.quantity && (
                <span className="text-sm text-muted-foreground">
                  Total: {formatCurrency(item.cost * item.quantity)}
                </span>
              )}
            </div>
          )}
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