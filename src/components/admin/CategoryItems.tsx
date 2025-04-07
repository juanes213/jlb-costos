
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { Project, Category, StorageItem } from "@/types/project";
import { CategoryItemSelector } from "./category/CategoryItemSelector";
import { CategoryItemQuantity } from "./category/CategoryItemQuantity";
import { CategoryBaseCost } from "./category/CategoryBaseCost";
import { CategoryItemCosts } from "./category/CategoryItemCosts";
import { CategoryItemActions } from "./category/CategoryItemActions";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CategoryItemsProps {
  project: Project;
  category: Category;
  categoryIndex: number;
  onUpdateProject: (project: Project) => void;
}

export function CategoryItems({
  project,
  category,
  categoryIndex,
  onUpdateProject,
}: CategoryItemsProps) {
  const [categoryBaseCost, setCategoryBaseCost] = useState<string>(category.cost?.toString() || "");
  const [manualEntryMode, setManualEntryMode] = useState<Record<number, boolean>>({});
  const [editedItems, setEditedItems] = useState<Record<number, {
    name: string;
    cost: number;
    unit: string;
  }>>({});
  const { toast } = useToast();
  
  const storageItems: StorageItem[] = JSON.parse(
    localStorage.getItem("storageItems") || "[]"
  );

  const storageCategories = Array.from(new Set(storageItems.map(item => item.categoryName)));

  const handleDeleteProjectItem = (itemIndex: number) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[
      categoryIndex
    ].items.filter((_, index) => index !== itemIndex);
    onUpdateProject(newProject);
  };

  const handleItemSelect = (itemIndex: number, storageItemId: string) => {
    const selectedItem = storageItems.find((item) => item.id === storageItemId);
    if (!selectedItem) return;

    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex] = {
      ...newProject.categories[categoryIndex].items[itemIndex],
      name: selectedItem.name,
      cost: selectedItem.cost,
      quantity: 1,
      unit: selectedItem.unit,
      ivaAmount: selectedItem.ivaAmount
    };
    onUpdateProject(newProject);
  };

  const handleManualSelect = (itemIndex: number) => {
    setManualEntryMode(prev => ({
      ...prev,
      [itemIndex]: true
    }));
    
    // Initialize the edited item with current values
    const currentItem = project.categories[categoryIndex].items[itemIndex];
    setEditedItems(prev => ({
      ...prev,
      [itemIndex]: {
        name: currentItem?.name || "",
        cost: currentItem?.cost || 0,
        unit: currentItem?.unit || ""
      }
    }));
  };

  const handleQuantityChange = (itemIndex: number, value: string) => {
    const quantity = value === '' ? 0 : parseInt(value, 10);
    
    const newProject = { ...project };
    const item = newProject.categories[categoryIndex].items[itemIndex];
    item.quantity = isNaN(quantity) ? 0 : quantity;
    onUpdateProject(newProject);
  };

  const handleCategoryBaseCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCategoryBaseCost(numericValue);
    
    const newProject = { ...project };
    newProject.categories[categoryIndex].cost = parseFloat(numericValue) || 0;
    onUpdateProject(newProject);
  };

  const handleItemNameChange = (itemIndex: number, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        name: value
      }
    }));
  };

  const handleItemCostChange = (itemIndex: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cost = parseFloat(numericValue) || 0;
    
    setEditedItems(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        cost: cost
      }
    }));
  };

  const handleItemUnitChange = (itemIndex: number, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        unit: value
      }
    }));
  };

  const handleApplyManualChanges = (itemIndex: number) => {
    if (!editedItems[itemIndex]) return;
    
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex] = {
      ...newProject.categories[categoryIndex].items[itemIndex],
      name: editedItems[itemIndex].name,
      cost: editedItems[itemIndex].cost,
      unit: editedItems[itemIndex].unit
    };
    
    onUpdateProject(newProject);
  };

  const handleIvaCalculated = (itemIndex: number, ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const handleSaveToStorage = async (itemIndex: number) => {
    // First apply any pending changes to the project
    handleApplyManualChanges(itemIndex);
    
    const item = project.categories[categoryIndex].items[itemIndex];
    if (!item.name || !item.cost) {
      toast({
        title: "Error",
        description: "El nombre y el costo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('storage_items')
        .insert({
          categoryName: category.name,
          name: item.name,
          cost: item.cost,
          unit: item.unit || null,
          ivaAmount: item.ivaAmount || null
        });
        
      if (error) {
        console.error("Error adding item to storage:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar el item en el almacén",
          variant: "destructive",
        });
        return;
      }
      
      // Update the item in the project to no longer be in manual entry mode
      setManualEntryMode(prev => ({
        ...prev,
        [itemIndex]: false
      }));
      
      toast({
        title: "Éxito",
        description: "Item guardado en el almacén correctamente",
      });
      
      // Refresh storage items
      const { data: updatedItems } = await supabase
        .from('storage_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (updatedItems) {
        const mappedItems = updatedItems.map(item => ({
          id: item.id,
          categoryName: item.categoryName,
          name: item.name,
          cost: item.cost,
          unit: item.unit || "",
          ivaAmount: item.ivaAmount || undefined
        }));
        localStorage.setItem("storageItems", JSON.stringify(mappedItems));
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el item",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = () => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].items.push({
      name: "",
      cost: 0,
      quantity: 1
    });
    onUpdateProject(newProject);
  };

  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Skip rendering for Personal category as it's now handled separately
  if (category.name === "Personal") {
    return null;
  }

  const isStorageCategory = storageCategories.includes(category.name);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <CategoryBaseCost
          categoryBaseCost={categoryBaseCost}
          onBaseCostChange={handleCategoryBaseCostChange}
        />
      </div>

      {category.items.map((item, itemIndex) => (
        <div
          key={itemIndex}
          className="flex items-center justify-between ml-4 flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 flex-1">
            {isStorageCategory ? (
              manualEntryMode[itemIndex] ? (
                <div className="flex gap-2">
                  <Input
                    value={editedItems[itemIndex]?.name || ""}
                    onChange={(e) => handleItemNameChange(itemIndex, e.target.value)}
                    placeholder="Nombre del item"
                    className="w-48 border-blue-200 focus:border-blue-400"
                  />
                  <Input
                    value={editedItems[itemIndex]?.unit || ""}
                    onChange={(e) => handleItemUnitChange(itemIndex, e.target.value)}
                    placeholder="Unidad"
                    className="w-20 border-blue-200 focus:border-blue-400"
                  />
                  <Button 
                    onClick={() => {
                      handleApplyManualChanges(itemIndex);
                      handleSaveToStorage(itemIndex);
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Guardar en almacén
                  </Button>
                  <Button 
                    onClick={() => handleApplyManualChanges(itemIndex)} 
                    variant="default" 
                    size="sm"
                  >
                    Aplicar
                  </Button>
                </div>
              ) : (
                <CategoryItemSelector
                  storageItems={storageItems.filter(si => si.categoryName === category.name)}
                  selectedItemName={item.name}
                  onItemSelect={(value) => handleItemSelect(itemIndex, value)}
                  onManualSelect={() => handleManualSelect(itemIndex)}
                  categoryName={category.name}
                />
              )
            ) : (
              <div className="flex gap-2">
                <Input
                  value={editedItems[itemIndex]?.name || item.name}
                  onChange={(e) => handleItemNameChange(itemIndex, e.target.value)}
                  placeholder="Nombre del item"
                  className="w-48 border-blue-200 focus:border-blue-400"
                />
                <Button 
                  onClick={() => handleApplyManualChanges(itemIndex)} 
                  variant="default" 
                  size="sm"
                >
                  Aplicar
                </Button>
              </div>
            )}
            <CategoryItemQuantity
              quantity={item.quantity || 1}
              unit={item.unit || ""}
              onChange={(value) => handleQuantityChange(itemIndex, value)}
            />
            
            {(!isStorageCategory || manualEntryMode[itemIndex]) && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Costo:</label>
                <Input
                  type="text"
                  value={editedItems[itemIndex]?.cost ? formatCurrency(editedItems[itemIndex].cost) : formatCurrency(item.cost)}
                  onChange={(e) => handleItemCostChange(itemIndex, e.target.value)}
                  placeholder="Costo del item"
                  className="w-40 border-blue-200 focus:border-blue-400"
                />
                <Button 
                  onClick={() => handleApplyManualChanges(itemIndex)} 
                  variant="default" 
                  size="sm"
                >
                  Aplicar
                </Button>
              </div>
            )}
            
            {item.cost !== undefined && (
              <CategoryItemCosts
                cost={item.cost}
                quantity={item.quantity || 1}
                ivaAmount={item.ivaAmount}
                onIvaCalculated={(amount) => handleIvaCalculated(itemIndex, amount)}
              />
            )}
          </div>
          <CategoryItemActions
            onDelete={() => handleDeleteProjectItem(itemIndex)}
          />
        </div>
      ))}
      
      <Button
        onClick={handleAddItem}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir item
      </Button>
    </div>
  );
}
