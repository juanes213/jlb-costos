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
  const { projects, addProject, deleteProject, exportProjectCSV, updateProject } = useProjects();
  const [newProjectName, setNewProjectName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditingProject, setIsEditingProject] = useState<string | null>(null);
  const [editedProjectName, setEditedProjectName] = useState("");

  const handleAddCategory = () => {
    setCategories([...categories, { name: "", items: [] }]);
  };

  const handleCategoryNameChange = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

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
    const newCategories = categories.filter((_, index) => index !== categoryIndex);
    setCategories(newCategories);
  };

  const handleDeleteItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    setCategories(newCategories);
  };

  const handleDeleteProjectCategory = (projectId: string, categoryIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories = newProject.categories.filter((_, index) => index !== categoryIndex);
    updateProject(newProject);
  };

  const handleDeleteProjectItem = (projectId: string, categoryIndex: number, itemIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    updateProject(newProject);
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
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage projects and their categories
          </p>
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
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
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
