import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Category } from "@/types/project";

interface ProjectFormProps {
  onCreateProject: (name: string, categories: Category[]) => void;
}

export function ProjectForm({ onCreateProject }: ProjectFormProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const handleAddCategory = () => {
    setCategories([...categories, { name: "", items: [] }]);
  };

  const handleCategoryNameChange = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  const handleAddItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push({ name: "", cost: 0 });
    setCategories(newCategories);
  };

  const handleItemNameChange = (
    categoryIndex: number,
    itemIndex: number,
    name: string
  ) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex].name = name;
    setCategories(newCategories);
  };

  const handleDeleteCategory = (categoryIndex: number) => {
    setCategories(categories.filter((_, index) => index !== categoryIndex));
  };

  const handleDeleteItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    setCategories(newCategories);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (categories.some((c) => !c.name.trim())) {
      toast({
        title: "Error",
        description: "All categories must have names",
        variant: "destructive",
      });
      return;
    }

    if (categories.some((c) => c.items.some((item) => !item.name.trim()))) {
      toast({
        title: "Error",
        description: "All items must have names",
        variant: "destructive",
      });
      return;
    }

    onCreateProject(newProjectName, categories);
    setNewProjectName("");
    setCategories([]);

    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <Input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Enter project name"
          className="border-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-primary">Categories</h3>
          <Button onClick={handleAddCategory} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4 p-4 border rounded-lg border-blue-100">
            <div className="flex items-center space-x-2">
              <Input
                value={category.name}
                onChange={(e) =>
                  handleCategoryNameChange(categoryIndex, e.target.value)
                }
                placeholder="Category name"
                className="border-blue-200 focus:border-blue-400"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteCategory(categoryIndex)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-2">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      handleItemNameChange(
                        categoryIndex,
                        itemIndex,
                        e.target.value
                      )
                    }
                    placeholder="Item name"
                    className="border-blue-200 focus:border-blue-400"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteItem(categoryIndex, itemIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleAddItem(categoryIndex)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleCreateProject} className="w-full">
        Create Project
      </Button>
    </div>
  );
}