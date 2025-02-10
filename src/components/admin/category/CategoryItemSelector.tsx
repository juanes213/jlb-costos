
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StorageItem } from "@/types/project";

interface CategoryItemSelectorProps {
  storageItems: StorageItem[];
  selectedItemName: string;
  onItemSelect: (itemId: string) => void;
}

export function CategoryItemSelector({
  storageItems,
  selectedItemName,
  onItemSelect,
}: CategoryItemSelectorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Select
      value={selectedItemName ? storageItems.find(item => item.name === selectedItemName)?.id : undefined}
      onValueChange={onItemSelect}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Seleccionar item">
          {selectedItemName || "Seleccionar item"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {storageItems
          .filter(si => si.categoryName === "Insumos")
          .map((si) => (
            <SelectItem key={si.id} value={si.id}>
              {si.name} - {formatCurrency(si.cost)} ({si.unit})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
