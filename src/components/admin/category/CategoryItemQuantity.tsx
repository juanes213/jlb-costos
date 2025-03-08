
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
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to number to avoid string concatenation problems
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        className="w-20 border-blue-200 focus:border-blue-400"
        min="0.1"
        step="0.1"
      />
      <span className="text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
