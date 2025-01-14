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
      minimumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    return parseFloat(numericValue) || 0;
  };

  const handleCostChange = (categoryIndex: number, itemIndex: number | null, value: string) => {
    if (!selectedProject) return;
  
    // Handle empty input
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
  
    // Remove non-numeric characters except for digits
    const numericValue = value.replace(/\D/g, "");
  
    // Convert to a float by dividing by 100 to handle decimals
    const floatValue = parseFloat(numericValue) / 100;
  
    // Update the project's cost
    const newProject: Project = JSON.parse(JSON.stringify(selectedProject));
    if (itemIndex === null) {
      newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    } else {
      newProject.categories[categoryIndex].items[itemIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    }
  
    updateProject(newProject);
  };

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Costs saved successfully",
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">Cost Management</h1>
          <p className="text-muted-foreground">
            Select a project and input costs
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/login")}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Card className="p-6 space-y-6 bg-white shadow-md">
        <div>
          <label className="block text-sm font-medium mb-2 text-primary">
            Select Project
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Choose a project" />
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
                      <span className="flex-1">Category Cost</span>
                      <Input
                        type="text"
                        value={category.cost ? formatCurrency(category.cost) : ""}
                        onChange={(e) => handleCostChange(categoryIndex, null, e.target.value)}
                        placeholder="$0.00"
                        className="w-32 border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  ) : (
                    category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-4"
                      >
                        <span className="flex-1">{item.name}</span>
                        <Input
                          type="text"
                          value={item.cost ? formatCurrency(item.cost) : ""}
                          onChange={(e) => handleCostChange(categoryIndex, itemIndex, e.target.value)}
                          placeholder="$0.00"
                          className="w-32 border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <Button onClick={handleSave} className="w-full">
              Save Costs
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
