
import { Input } from "@/components/ui/input";

interface CategoryBaseCostProps {
  categoryBaseCost: string;
  onBaseCostChange: (value: string) => void;
}

export function CategoryBaseCost({ categoryBaseCost, onBaseCostChange }: CategoryBaseCostProps) {
  const formatCurrency = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={categoryBaseCost ? formatCurrency(parseFloat(categoryBaseCost)) : ""}
        onChange={(e) => onBaseCostChange(e.target.value)}
        placeholder="Costo base de la categoría"
        className="w-40 border-blue-200 focus:border-blue-400"
      />
    </div>
  );
}
