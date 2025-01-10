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
import type { Project } from "@/types/project";

export default function GuestDashboard() {
  const { projects, updateProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { toast } = useToast();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCostChange = (
    categoryIndex: number,
    itemIndex: number,
    cost: string
  ) => {
    if (!selectedProject) return;

    const newProject: Project = JSON.parse(JSON.stringify(selectedProject));
    newProject.categories[categoryIndex].items[itemIndex].cost = parseFloat(cost) || 0;

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
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Cost Management</h1>
        <p className="text-muted-foreground">
          Select a project and input costs
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Project
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger>
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
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center space-x-4"
                    >
                      <span className="flex-1">{item.name}</span>
                      <Input
                        type="number"
                        value={item.cost}
                        onChange={(e) =>
                          handleCostChange(
                            categoryIndex,
                            itemIndex,
                            e.target.value
                          )
                        }
                        className="w-32"
                      />
                    </div>
                  ))}
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