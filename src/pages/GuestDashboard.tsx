import { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/types/project";
import { IvaButton } from "@/components/shared/IvaButton";

export default function GuestDashboard() {
  const { projects, updateProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const formatCurrency = (value: number) => {
    if (!value) return ""; 
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCostChange = (categoryIndex: number, itemIndex: number | null, value: string) => {
    if (!selectedProject) return;
  
    if (value === "") {
      const newProject: Project = JSON.parse(JSON.stringify(selectedProject));
      if (itemIndex === null) {
        newProject.categories[categoryIndex].cost = 0;
      } else {
        newProject.categories[categoryIndex].items[itemIndex].cost = 0;
      }
      updateProject(newProject);
      return;
    }
  
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue);
  
    const newProject: Project = JSON.parse(JSON.stringify(selectedProject));
    if (itemIndex === null) {
      newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    }
  
    updateProject(newProject);
  };

  const handleIvaCalculated = (categoryIndex: number, itemIndex: number | null, ivaAmount: number | undefined) => {
    if (!selectedProject) return;
  
    const newProject: Project = JSON.parse(JSON.stringify(selectedProject));
    if (itemIndex === null) {
      newProject.categories[categoryIndex].ivaAmount = ivaAmount;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].ivaAmount = ivaAmount;
    }
  
    updateProject(newProject);
  };

  const handleSave = () => {
    toast({
      title: "Éxito",
      description: "Costes guardados con éxito",
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">Gestión de costes</h1>
          <p className="text-muted-foreground">
            Seleccione un proyecto e introduzca los costes
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/login")}>
          <LogOut className="w-4 h-4 mr-2" />
          Cierre de sesión
        </Button>
      </div>

      <Card className="p-6 space-y-6 bg-white shadow-md">
        <div>
          <label className="block text-sm font-medium mb-2 text-primary">
            Seleccionar Proyecto
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Elija un proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProject && (
          <div className="space-y-6">
            {selectedProject.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-lg font-medium text-primary">{category.name}</h3>
                <div className="space-y-2">
                  {category.items.length === 0 ? (
                    <div className="flex items-center space-x-4">
                      <span className="flex-1">Costo de Categoría</span>
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={category.cost ? formatCurrency(category.cost) : ""}
                          onChange={(e) => handleCostChange(categoryIndex, null, e.target.value)}
                          placeholder="$0"
                          className="w-32 border-blue-200 focus:border-blue-400"
                        />
                        <IvaButton
                          cost={category.cost || 0}
                          onIvaCalculated={(amount) => handleIvaCalculated(categoryIndex, null, amount)}
                          ivaAmount={category.ivaAmount}
                        />
                        {category.ivaAmount && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            IVA: {formatCurrency(category.ivaAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-4"
                      >
                        <span className="flex-1">{item.name}</span>
                        <div className="flex items-center">
                          <Input
                            type="text"
                            value={item.cost ? formatCurrency(item.cost) : ""}
                            onChange={(e) => handleCostChange(categoryIndex, itemIndex, e.target.value)}
                            placeholder="$0"
                            className="w-32 border-blue-200 focus:border-blue-400"
                          />
                          <IvaButton
                            cost={item.cost}
                            onIvaCalculated={(amount) => handleIvaCalculated(categoryIndex, itemIndex, amount)}
                            ivaAmount={item.ivaAmount}
                          />
                          {item.ivaAmount && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              IVA: {formatCurrency(item.ivaAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <Button onClick={handleSave} className="w-full">
              Guardar Costos
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}