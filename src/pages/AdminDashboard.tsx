import { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Category, Project } from "@/types/project";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, exportProjectCSV } = useProjects();
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

    if (
      categories.some((c) =>
        c.items.some((item) => !item.name.trim())
      )
    ) {
      toast({
        title: "Error",
        description: "All items must have names",
        variant: "destructive",
      });
      return;
    }

    addProject({
      name: newProjectName,
      categories,
    });

    setNewProjectName("");
    setCategories([]);

    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage projects and their categories
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Create New Project</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Categories</h3>
              <Button onClick={handleAddCategory} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4 p-4 border rounded-lg">
                <Input
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryNameChange(categoryIndex, e.target.value)
                  }
                  placeholder="Category name"
                />

                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <Input
                      key={itemIndex}
                      value={item.name}
                      onChange={(e) =>
                        handleItemNameChange(
                          categoryIndex,
                          itemIndex,
                          e.target.value
                        )
                      }
                      placeholder="Item name"
                    />
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
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <span className="font-medium">{project.name}</span>
              <div className="space-x-2">
                <Button
                  onClick={() => exportProjectCSV(project)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={() => deleteProject(project.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}