import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";
import { IvaButton } from "../shared/IvaButton";

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCostChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue);
    
    const newProject = { ...project };
    newProject.categories[categoryIndex].cost = isNaN(floatValue) ? 0 : floatValue;
    onUpdateProject(newProject);
  };

  const handleIvaCalculated = (ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const currentCost = project.categories[categoryIndex].cost || 0;
  const currentIvaAmount = project.categories[categoryIndex].ivaAmount;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={formatCurrency(currentCost)}
        onChange={(e) => handleCostChange(e.target.value)}
        placeholder="$0"
        className="w-32 border-blue-200 focus:border-blue-400"
      />
      <IvaButton
        cost={currentCost}
        onIvaCalculated={handleIvaCalculated}
        ivaAmount={currentIvaAmount}
      />
      {currentIvaAmount && (
        <span className="text-sm text-muted-foreground">
          IVA: {formatCurrency(currentIvaAmount)}
        </span>
      )}
    </div>
  );
}