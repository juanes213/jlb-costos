import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectList({ projects, onUpdateProject, onDeleteProject }: ProjectListProps) {
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [editedNumberIds, setEditedNumberIds] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<{projectId: string, categoryIndex: number} | null>(null);
  const [editingItem, setEditingItem] = useState<{projectId: string, categoryIndex: number, itemIndex: number} | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedItemName, setEditedItemName] = useState("");
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleCostChange = (projectId: string, categoryIndex: number, itemIndex: number | null, value: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
  
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue) / 100;
    
    const newProject = { ...project };
    
    if (itemIndex === null) {
      newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    }
  
    onUpdateProject(newProject);
  };

  const toggleEditing = (projectId: string) => {
    setEditingStates(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
    setEditedNames(prev => ({
      ...prev,
      [projectId]: projects.find(p => p.id === projectId)?.name || ""
    }));
    setEditedNumberIds(prev => ({
      ...prev,
      [projectId]: projects.find(p => p.id === projectId)?.numberId || 0
    }));
  };

  const handleSaveEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    onUpdateProject({
      ...project,
      name: editedNames[projectId],
      numberId: editedNumberIds[projectId]
    });

    setEditingStates(prev => ({
      ...prev,
      [projectId]: false
    }));

    toast({
      title: "Éxito",
      description: "Proyecto actualizado correctamente",
    });
  };

  const startEditingCategory = (projectId: string, categoryIndex: number, currentName: string) => {
    setEditingCategory({ projectId, categoryIndex });
    setEditedCategoryName(currentName);
  };

  const startEditingItem = (projectId: string, categoryIndex: number, itemIndex: number, currentName: string) => {
    setEditingItem({ projectId, categoryIndex, itemIndex });
    setEditedItemName(currentName);
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;

    const project = projects.find(p => p.id === editingCategory.projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories[editingCategory.categoryIndex].name = editedCategoryName;
    onUpdateProject(newProject);

    setEditingCategory(null);
    setEditedCategoryName("");

    toast({
      title: "Éxito",
      description: "Categoría actualizada correctamente",
    });
  };

  const handleSaveItemEdit = () => {
    if (!editingItem) return;

    const project = projects.find(p => p.id === editingItem.projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories[editingItem.categoryIndex].items[editingItem.itemIndex].name = editedItemName;
    onUpdateProject(newProject);

    setEditingItem(null);
    setEditedItemName("");

    toast({
      title: "Éxito",
      description: "Elemento actualizado con éxito",
    });
  };

  const handleDeleteProjectCategory = (projectId: string, categoryIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories = newProject.categories.filter((_, index) => index !== categoryIndex);
    onUpdateProject(newProject);
  };

  const handleDeleteProjectItem = (projectId: string, categoryIndex: number, itemIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newProject = { ...project };
    newProject.categories[categoryIndex].items = newProject.categories[categoryIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    onUpdateProject(newProject);
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="space-y-4 p-4 border rounded-lg border-blue-100"
        >
          <div className="flex items-center justify-between">
            {editingStates[project.id] ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={editedNames[project.id]}
                  onChange={(e) => setEditedNames(prev => ({
                    ...prev,
                    [project.id]: e.target.value
                  }))}
                  placeholder="Nombre del proyecto"
                  className="border-blue-200 focus:border-blue-400"
                />
                <Input
                  type="number"
                  value={editedNumberIds[project.id]}
                  onChange={(e) => setEditedNumberIds(prev => ({
                    ...prev,
                    [project.id]: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Número ID"
                  className="border-blue-200 focus:border-blue-400 w-32"
                />
                <Button onClick={() => handleSaveEdit(project.id)} size="sm">
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <span className="font-medium text-primary">{project.name}</span>
                <span className="text-sm text-muted-foreground">ID: {project.numberId}</span>
              </div>
            )}
            <div className="space-x-2">
              <Button
                onClick={() => toggleEditing(project.id)}
                variant="outline"
                size="sm"
              >
                <Pencil className="w-4 h-4 mr-2" />
                {editingStates[project.id] ? "Cancelar" : "Editar"}
              </Button>
              <Button
                onClick={() => onDeleteProject(project.id)}
                variant="destructive"
                size="sm"
              >
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
          {project.categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="ml-4 space-y-2">
              <div className="flex items-center justify-between">
                {editingCategory?.projectId === project.id && 
                 editingCategory?.categoryIndex === categoryIndex ? (
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
                      onClick={() => startEditingCategory(project.id, categoryIndex, category.name)}
                      variant="ghost"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {category.items.length === 0 && (
                    <Input
                      type="text"
                      value={category.cost ? formatCurrency(category.cost) : ""}
                      onChange={(e) => handleCostChange(project.id, categoryIndex, null, e.target.value)}
                      placeholder="$0.00"
                      className="w-32 border-blue-200 focus:border-blue-400"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteProjectCategory(project.id, categoryIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between ml-4">
                  {editingItem?.projectId === project.id && 
                   editingItem?.categoryIndex === categoryIndex &&
                   editingItem?.itemIndex === itemIndex ? (
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
                        onClick={() => startEditingItem(project.id, categoryIndex, itemIndex, item.name)}
                        variant="ghost"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={formatCurrency(item.cost)}
                      onChange={(e) => handleCostChange(project.id, categoryIndex, itemIndex, e.target.value)}
                      placeholder="$0.00"
                      className="w-32 border-blue-200 focus:border-blue-400"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProjectItem(project.id, categoryIndex, itemIndex)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
