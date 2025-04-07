
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ItemCostEditorProps {
  cost: number;
  onChange: (value: string) => void;
  onApply: () => void;
}

export function ItemCostEditor({ cost, onChange, onApply }: ItemCostEditorProps) {
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
      <label className="text-sm text-muted-foreground">Costo:</label>
      <Input
        type="text"
        value={formatCurrency(cost)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Costo del item"
        className="w-40 border-blue-200 focus:border-blue-400"
      />
      <Button 
        onClick={onApply} 
        variant="default" 
        size="sm"
      >
        Aplicar
      </Button>
    </div>
  );
}
