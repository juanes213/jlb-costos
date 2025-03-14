
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";
import { CategoryItems } from "./CategoryItems";
import { CategoryCost } from "./CategoryCost";

interface ProjectCategoriesProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectCategories({ project, onUpdateProject }: ProjectCategoriesProps) {
  const [editingCategory, setEditingCategory] = useState<{categoryIndex: number} | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const { toast } = useToast();

  // Ensure categories is an array, parse it if it's a string
  const categories = Array.isArray(project.categories) 
    ? project.categories 
    : (typeof project.categories === 'string' ? JSON.parse(project.categories) : []);

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;

    const newProject = { ...project };
    
    // Ensure categories is an array before updating
    if (!Array.isArray(newProject.categories) && typeof newProject.categories === 'string') {
      newProject.categories = JSON.parse(newProject.categories);
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
      newProject.categories = JSON.parse(newProject.categories);
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
                <h4 className="font-medium">{category.name}</h4>
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
        </div>
      ))}
    </>
  );
}
