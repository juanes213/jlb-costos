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

  const calculateTotalCost = () => {
    const category = project.categories[categoryIndex];
    return category.items.reduce((total, item) => {
      return total + (item.cost * (item.quantity || 1));
    }, 0);
  };

  const handleIvaCalculated = (ivaAmount: number | undefined) => {
    const newProject = { ...project };
    newProject.categories[categoryIndex].ivaAmount = ivaAmount;
    onUpdateProject(newProject);
  };

  const totalCost = calculateTotalCost();
  const currentIvaAmount = project.categories[categoryIndex].ivaAmount;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Total: {formatCurrency(totalCost)}
      </span>
      <IvaButton
        cost={totalCost}
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