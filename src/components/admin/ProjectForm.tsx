import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Category } from "@/types/project";

interface ProjectFormProps {
  onCreateProject: (name: string, categories: Category[], initialDate?: Date, finalDate?: Date) => void;
}

export function ProjectForm({ onCreateProject }: ProjectFormProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
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
        description: "El nombre del proyecto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (categories.some((c) => !c.name.trim())) {
      toast({
        title: "Error",
        description: "Todas las categorías deben tener nombre",
        variant: "destructive",
      });
      return;
    }

    if (categories.some((c) => c.items.some((item) => !item.name.trim()))) {
      toast({
        title: "Error",
        description: "Todos los artículos deben tener nombre",
        variant: "destructive",
      });
      return;
    }

    onCreateProject(
      newProjectName,
      categories,
      initialDate ? new Date(initialDate) : undefined,
      finalDate ? new Date(finalDate) : undefined
    );
    
    setNewProjectName("");
    setInitialDate("");
    setFinalDate("");
    setCategories([]);

    toast({
      title: "Éxito",
      description: "Proyecto creado con éxito",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del Proyecto</label>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Introduzca el nombre del proyecto"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicial</label>
            <Input
              type="date"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fecha Final</label>
            <Input
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-primary">Categorías</h3>
          <Button onClick={handleAddCategory} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Añadir categoría
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
                placeholder="Nombre de la categoría"
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
              Añadir elemento
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleCreateProject} className="w-full">
        Crear proyecto
      </Button>
    </div>
  );
}
