import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";

interface CategoryCostProps {
  project: Project;
  categoryIndex: number;
  onUpdateProject: (project: Project) => void;
}

export function CategoryCost({ project, categoryIndex, onUpdateProject }: CategoryCostProps) {
  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue) / 100;
    
    const newProject = { ...project };
    newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    onUpdateProject(newProject);
  };

  return (
    <Input
      type="text"
      value={formatCurrency(project.categories[categoryIndex].cost || 0)}
      onChange={(e) => handleCostChange(e.target.value)}
      placeholder="$0.00"
      className="w-32 border-blue-200 focus:border-blue-400"
    />
  );
}