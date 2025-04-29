
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";
import { CategoryItems } from "./CategoryItems";
import { CategoryCost } from "./CategoryCost";

// Helper function to ensure categories is always an array
function ensureCategoriesArray(categories: any) {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === 'string') {
    try {
      const parsed = JSON.parse(categories);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing categories:", e);
      return [];
    }
  }
  return [];
}

interface ProjectCategoriesProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectCategories({ project, onUpdateProject }: ProjectCategoriesProps) {
  const [editingCategory, setEditingCategory] = useState<{categoryIndex: number} | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const { toast } = useToast();

  // Ensure categories is an array, parse it if it's a string
  const categories = ensureCategoriesArray(project.categories);

  // Function to calculate total cost of a category
  const calculateCategoryCost = (categoryIndex: number): number => {
    const category = categories[categoryIndex];
    let totalCost = category.cost || 0;
    
    // Add IVA amount if exists
    if (category.ivaAmount) {
      totalCost += category.ivaAmount;
    }
    
    // Sum all item costs
    category.items.forEach(item => {
      const quantity = item.quantity || 1;
      totalCost += item.cost * quantity;
      
      // Add item IVA if exists
      if (item.ivaAmount) {
        totalCost += item.ivaAmount;
      }
    });
    
    return totalCost;
  };

  // Format currency for displaying costs
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;

    const newProject = { ...project };
    
    // Ensure categories is an array before updating
    if (!Array.isArray(newProject.categories) && typeof newProject.categories === 'string') {
      try {
        newProject.categories = JSON.parse(newProject.categories);
      } catch (e) {
        console.error("Error parsing project categories:", e);
        newProject.categories = [];
        return;
      }
    } else if (!Array.isArray(newProject.categories)) {
      newProject.categories = [];
    }
    
    newProject.categories[editingCategory.categoryIndex].name = editedCategoryName;
    onUpdateProject(newProject);

    setEditingCategory(null);
    setEditedCategoryName("");

    toast({
      title: "Éxito",
      description: "Categoría actualizada correctamente",
    });
  };

  const handleDeleteProjectCategory = (categoryIndex: number) => {
    const newProject = { ...project };
    
    // Ensure categories is an array before filtering
    if (!Array.isArray(newProject.categories) && typeof newProject.categories === 'string') {
      try {
        newProject.categories = JSON.parse(newProject.categories);
      } catch (e) {
        console.error("Error parsing project categories:", e);
        return;
      }
    } else if (!Array.isArray(newProject.categories)) {
      newProject.categories = [];
      return;
    }
    
    newProject.categories = newProject.categories.filter((_, index) => index !== categoryIndex);
    onUpdateProject(newProject);
  };

  return (
    <>
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="ml-4 space-y-2">
          <div className="flex items-center justify-between">
            {editingCategory?.categoryIndex === categoryIndex ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  className="w-48 border-blue-200 focus:border-blue-400"
                />
                <Button onClick={handleSaveCategoryEdit} size="sm">Save</Button>
                <Button 
                  onClick={() => setEditingCategory(null)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="font-medium">
                  {category.name}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formatCurrency(calculateCategoryCost(categoryIndex))}
                  </span>
                </h4>
                <Button
                  onClick={() => {
                    setEditingCategory({ categoryIndex });
                    setEditedCategoryName(category.name);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteProjectCategory(categoryIndex)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          <CategoryItems
            project={project}
            category={category}
            categoryIndex={categoryIndex}
            onUpdateProject={onUpdateProject}
          />
          <CategoryCost 
            project={project} 
            categoryIndex={categoryIndex}
            onUpdateProject={onUpdateProject}
          />
        </div>
      ))}
    </>
  );
}
