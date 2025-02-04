import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil } from "lucide-react";
import { IvaButton } from "../shared/IvaButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StorageItem } from "@/types/project";
import { useState } from "react";

interface StorageTableProps {
  items: StorageItem[];
  onDeleteItem: (id: string) => void;
  onEditItem: (item: StorageItem) => void;
}

export function StorageTable({ items, onDeleteItem, onEditItem }: StorageTableProps) {
  const [ivaAmounts, setIvaAmounts] = useState<Record<string, number>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleIvaCalculated = (itemId: string, ivaAmount: number | undefined) => {
    setIvaAmounts(prev => ({
      ...prev,
      [itemId]: ivaAmount || 0
    }));
  };

  return (
    <Card className="p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-primary">Items en Almacén</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.categoryName}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{formatCurrency(item.cost)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <IvaButton
                    cost={item.cost}
                    onIvaCalculated={(amount) => handleIvaCalculated(item.id, amount)}
                    ivaAmount={ivaAmounts[item.id]}
                  />
                  {ivaAmounts[item.id] > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(ivaAmounts[item.id])}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditItem(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}