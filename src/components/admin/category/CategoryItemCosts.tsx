
import { IvaButton } from "../../shared/IvaButton";

interface CategoryItemCostsProps {
  cost: number;
  quantity: number;
  ivaAmount?: number;
  onIvaCalculated: (amount: number | undefined) => void;
}

export function CategoryItemCosts({ 
  cost, 
  quantity, 
  ivaAmount, 
  onIvaCalculated 
}: CategoryItemCostsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Total: {formatCurrency(cost * quantity)}
      </span>
      <IvaButton
        cost={cost * quantity}
        onIvaCalculated={onIvaCalculated}
        ivaAmount={ivaAmount}
      />
      {ivaAmount && (
        <span className="text-sm text-muted-foreground">
          IVA: {formatCurrency(ivaAmount)}
        </span>
      )}
    </div>
  );
}
