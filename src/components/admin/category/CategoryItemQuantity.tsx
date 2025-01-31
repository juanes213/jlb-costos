import { Input } from "@/components/ui/input";

interface CategoryItemQuantityProps {
  quantity: number;
  unit: string;
  onChange: (value: string) => void;
}

export function CategoryItemQuantity({
  quantity,
  unit,
  onChange,
}: CategoryItemQuantityProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={quantity}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 border-blue-200 focus:border-blue-400"
        min="1"
      />
      <span className="text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}