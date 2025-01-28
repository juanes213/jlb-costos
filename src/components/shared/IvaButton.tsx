import { Button } from "@/components/ui/button";
import { Percent } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface IvaButtonProps {
  cost: number;
  onIvaCalculated: (ivaAmount: number | undefined) => void;
  ivaAmount?: number;
}

export function IvaButton({ cost, onIvaCalculated, ivaAmount }: IvaButtonProps) {
  const { toast } = useToast();

  const toggleIva = () => {
    if (ivaAmount) {
      // If IVA is already calculated, remove it
      onIvaCalculated(undefined);
      toast({
        title: "IVA removido",
        description: "Se ha eliminado el cálculo del IVA.",
      });
    } else {
      // Calculate new IVA
      const newIvaAmount = cost * 0.19;
      onIvaCalculated(newIvaAmount);
      toast({
        title: "IVA calculado",
        description: "Se ha calculado el IVA (19%) del costo.",
      });
    }
  };

  return (
    <Button
      variant={ivaAmount ? "default" : "outline"}
      size="sm"
      onClick={toggleIva}
      className="ml-2"
    >
      <Percent className="w-4 h-4 mr-1" />
      IVA
    </Button>
  );
}