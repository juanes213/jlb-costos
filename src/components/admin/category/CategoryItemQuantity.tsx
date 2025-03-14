
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
    // Only accept integer values
    const value = e.target.value.replace(/\D/g, '');
    // Parse as integer (or empty string if value is empty)
    const parsedValue = value === '' ? '' : value;
    // Pass the raw value to parent component
    onChange(parsedValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={quantity === 0 ? "" : quantity}
        onChange={handleQuantityChange}
        className="w-20 border-blue-200 focus:border-blue-400"
        min="1"
        step="1"
      />
      {unit && (
        <span className="text-sm text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}
