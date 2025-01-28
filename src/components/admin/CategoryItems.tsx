import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, Category } from "@/types/project";
import { IvaButton } from "../shared/IvaButton";

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

  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCostChange = (itemIndex: number | null, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue);
    
    const newProject = { ...project };
    
    if (itemIndex === null) {
      newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    }
  
    onUpdateProject(newProject);
  };

  const handleIvaCalculated = (itemIndex: number | null, ivaAmount: number | undefined) => {
    const newProject = { ...project };
    
    if (itemIndex === null) {
      newProject.categories[categoryIndex].ivaAmount = ivaAmount;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    }
  
    onUpdateProject(newProject);
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
            <div className="flex items-center gap-2">
              <span>{item.name}</span>
              <Button
                onClick={() => {
                  setEditingItem({ itemIndex });
                  setEditedItemName(item.name);
                }}
                variant="ghost"
                size="sm"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Input
                type="text"
                value={formatCurrency(item.cost)}
                onChange={(e) => handleCostChange(itemIndex, e.target.value)}
                placeholder="$0"
                className="w-32 border-blue-200 focus:border-blue-400"
              />
              <IvaButton
                cost={item.cost}
                onIvaCalculated={(amount) => handleIvaCalculated(itemIndex, amount)}
                ivaAmount={item.ivaAmount}
              />
              {item.ivaAmount && (
                <span className="ml-2 text-sm text-muted-foreground">
                  IVA: {formatCurrency(item.ivaAmount)}
                </span>
              )}
            </div>
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