import { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash, Download, LogOut, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { Category, Project } from "@/types/project";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject, exportProjectCSV } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditingProject, setIsEditingProject] = useState<string | null>(null);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState<number | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedCategoryCost, setEditedCategoryCost] = useState<number | null>(null);
  const [isEditingItem, setIsEditingItem] = useState<{ categoryIndex: number, itemIndex: number } | null>(null);
  const [editedItemName, setEditedItemName] = useState("");
  const [editedItemCost, setEditedItemCost] = useState<number | null>(null);

  // 📝 Handle project edit mode
  const handleEditProject = (projectId: string, name: string) => {
    setIsEditingProject(projectId);
    setEditedProjectName(name);
  };

  const handleSaveProjectEdit = (projectId: string) => {
    if (!editedProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    updateProject({ ...project, name: editedProjectName });
    setIsEditingProject(null);
  };

  // 📝 Handle category edit mode
  const handleEditCategory = (categoryIndex: number, name: string, cost: number | null) => {
    setIsEditingCategory(categoryIndex);
    setEditedCategoryName(name);
    setEditedCategoryCost(cost);
  };

  const handleSaveCategoryEdit = (categoryIndex: number) => {
    if (!editedCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    const newCategories = [...categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      name: editedCategoryName,
      cost: editedCategoryCost ?? 0,
    };
    setCategories(newCategories);
    setIsEditingCategory(null);
  };

  // 📝 Handle item edit mode
  const handleEditItem = (categoryIndex: number, itemIndex: number, name: string, cost: number | null) => {
    setIsEditingItem({ categoryIndex, itemIndex });
    setEditedItemName(name);
    setEditedItemCost(cost);
  };

  const handleSaveItemEdit = (categoryIndex: number, itemIndex: number) => {
    if (!editedItemName.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex] = {
      ...newCategories[categoryIndex].items[itemIndex],
      name: editedItemName,
      cost: editedItemCost ?? 0,
    };
    setCategories(newCategories);
    setIsEditingItem(null);
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage projects and their categories</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/login")}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Card className="p-6 space-y-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold text-primary">Create New Project</h2>
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
                  {isEditingCategory === categoryIndex ? (
                    <>
                      <Input
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="border-blue-200 focus:border-blue-400"
                      />
                      <Input
                        type="number"
                        value={editedCategoryCost ?? ''}
                        onChange={(e) => setEditedCategoryCost(Number(e.target.value))}
                        placeholder="Category cost"
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <span className="font-medium">{category.cost}</span>
                    </>
                  )}
                  <div className="space-x-2">
                    {isEditingCategory === categoryIndex ? (
                      <Button
                        onClick={() => handleSaveCategoryEdit(categoryIndex)}
                        variant="outline"
                        size="sm"
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEditCategory(categoryIndex, category.name, category.cost)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteCategory(categoryIndex)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      {isEditingItem?.categoryIndex === categoryIndex && isEditingItem.itemIndex === itemIndex ? (
                        <>
                          <Input
                            value={editedItemName}
                            onChange={(e) => setEditedItemName(e.target.value)}
                            placeholder="Item name"
                            className="border-blue-200 focus:border-blue-400"
                          />
                          <Input
                            type="number"
                            value={editedItemCost ?? ''}
                            onChange={(e) => setEditedItemCost(Number(e.target.value))}
                            placeholder="Item cost"
                            className="border-blue-200 focus:border-blue-400"
                          />
                        </>
                      ) : (
                        <>
                          <span>{item.name}</span>
                          <span>{item.cost}</span>
                        </>
                      )}
                      <div className="space-x-2">
                        {isEditingItem?.categoryIndex === categoryIndex && isEditingItem.itemIndex === itemIndex ? (
                          <Button
                            onClick={() => handleSaveItemEdit(categoryIndex, itemIndex)}
                            variant="outline"
                            size="sm"
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleEditItem(categoryIndex, itemIndex, item.name, item.cost)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteItem(categoryIndex, itemIndex)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={() => handleAddItem(categoryIndex)} variant="outline" size="sm">
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

      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Existing Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="space-y-4 p-4 border rounded-lg border-blue-100"
            >
              <div className="flex items-center justify-between">
                {isEditingProject === project.id ? (
                  <Input
                    value={editedProjectName}
                    onChange={(e) => setEditedProjectName(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <span className="font-medium text-primary">{project.name}</span>
                )}
                <div className="space-x-2">
                  {isEditingProject === project.id ? (
                    <Button
                      onClick={() => handleSaveProjectEdit(project.id)}
                      variant="outline"
                      size="sm"
                    >
                      Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEditProject(project.id, project.name)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  )}
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
              {project.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{category.name}</h4>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProjectCategory(project.id, categoryIndex)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between ml-4">
                      <span>{item.name}</span>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteProjectItem(project.id, categoryIndex, itemIndex)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
