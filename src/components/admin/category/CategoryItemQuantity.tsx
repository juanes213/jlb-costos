
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
    // Allow empty value for fresh input, then convert to string
    const value = e.target.value === "" ? "0" : e.target.value;
    onChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={quantity === 0 ? "" : quantity}
        onChange={handleQuantityChange}
        className="w-20 border-blue-200 focus:border-blue-400"
        min="0.1"
        step="0.1"
      />
      {unit && (
        <span className="text-sm text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}
