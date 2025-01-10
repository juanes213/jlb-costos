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
  const [editingStates, setEditingStates] = useState<{[key: string]: boolean}>({});
  const [editedNames, setEditedNames] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add a new category
  const handleAddCategory = () => {
    setCategories([...categories, { name: "", items: [] }]);
  };

  // Handle category name change
  const handleCategoryNameChange = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  // Add a new item to a category
  const handleAddItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push({ name: "", cost: 0 });
    setCategories(newCategories);
  };

  // Handle item name change
  const handleItemNameChange = (categoryIndex: number, itemIndex: number, name: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex].name = name;
    setCategories(newCategories);
  };

  // Delete a category
  const handleDeleteCategory = (categoryIndex: number) => {
    const newCategories = categories.filter((_, index) => index !== categoryIndex);
    setCategories(newCategories);
  };

  // Delete an item from a category
  const handleDeleteItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    setCategories(newCategories);
  };

  // Toggle editing state for a project
  const toggleEditing = (projectId: string) => {
    setEditingStates(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
    // Initialize edited name if starting to edit
    if (!editingStates[projectId]) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setEditedNames(prev => ({
          ...prev,
          [projectId]: project.name
        }));
      }
    }
  };

  // Handle name edit
  const handleNameEdit = (projectId: string, newName: string) => {
    setEditedNames(prev => ({
      ...prev,
      [projectId]: newName
    }));
  };

  // Save edited project
  const saveProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && editedNames[projectId]) {
      updateProject({
        ...project,
        name: editedNames[projectId]
      });
      toggleEditing(projectId);
    }
  };

  // Create a new project
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

    addProject({ name: newProjectName, categories });
    setNewProjectName("");
    setCategories([]);
    toast({ title: "Success", description: "Project created successfully" });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      {/* Header */}
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

      {/* Create New Project */}
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

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-primary">Categories</h3>
              <Button onClick={handleAddCategory} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Category List */}
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4 p-4 border rounded-lg border-blue-100">
                <div className="flex items-center space-x-2">
                  <Input
                    value={category.name}
                    onChange={(e) => handleCategoryNameChange(categoryIndex, e.target.value)}
                    placeholder="Category name"
                    className="border-blue-200 focus:border-blue-400"
                  />
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(categoryIndex)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {/* Items in Category */}
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-2">
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemNameChange(categoryIndex, itemIndex, e.target.value)}
                        placeholder="Item name"
                        className="border-blue-200 focus:border-blue-400"
                      />
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(categoryIndex, itemIndex)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <Button onClick={() => handleAddItem(categoryIndex)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            ))}
          </div>

          {/* Create Project Button */}
          <Button onClick={handleCreateProject} className="w-full">
            Create Project
          </Button>
        </div>
      </Card>

      {/* Existing Projects */}
      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Existing Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="space-y-4 p-4 border rounded-lg border-blue-100">
              <div className="flex items-center justify-between">
                {editingStates[project.id] ? (
                  <Input
                    value={editedNames[project.id] || project.name}
                    onChange={(e) => handleNameEdit(project.id, e.target.value)}
                    placeholder="Edit project name"
                    className="w-full border-blue-200 focus:border-blue-400"
                  />
                ) : (
                  <span className="font-medium text-primary">{project.name}</span>
                )}
                <div className="space-x-2">
                  <Button
                    onClick={() => {
                      if (editingStates[project.id]) {
                        saveProject(project.id);
                      } else {
                        toggleEditing(project.id);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {editingStates[project.id] ? "Save" : <Edit className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => exportProjectCSV(project)} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => deleteProject(project.id)} variant="destructive" size="sm">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}