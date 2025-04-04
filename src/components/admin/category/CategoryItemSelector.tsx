
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { StorageItem } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CategoryItemSelectorProps {
  storageItems: StorageItem[];
  selectedItemName: string;
  onItemSelect: (itemId: string) => void;
  onManualSelect: () => void;
  categoryName: string;
}

export function CategoryItemSelector({
  storageItems,
  selectedItemName,
  onItemSelect,
  onManualSelect,
  categoryName,
}: CategoryItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter items based on search query
  const filteredItems = storageItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Select
      value={selectedItemName ? storageItems.find(item => item.name === selectedItemName)?.id : undefined}
      onValueChange={(value) => {
        if (value === "manual") {
          onManualSelect();
        } else {
          onItemSelect(value);
        }
      }}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Seleccionar item">
          {selectedItemName || "Seleccionar item"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2 border-blue-200 focus:border-blue-400"
          />
        </div>
        <SelectItem value="manual">Entrada manual</SelectItem>
        {filteredItems.map((si) => (
          <SelectItem key={si.id} value={si.id}>
            {si.name} - {formatCurrency(si.cost)} {si.unit ? `(${si.unit})` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
