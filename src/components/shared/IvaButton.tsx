import { Button } from "@/components/ui/button";
import { Percent } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface IvaButtonProps {
  cost: number;
  onIvaCalculated: (ivaAmount: number) => void;
}

export function IvaButton({ cost, onIvaCalculated }: IvaButtonProps) {
  const { toast } = useToast();

  const calculateIva = () => {
    const ivaAmount = cost * 0.19;
    onIvaCalculated(ivaAmount);
    
    toast({
      title: "IVA calculado",
      description: "Se ha calculado el IVA (19%) del costo.",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={calculateIva}
      className="ml-2"
    >
      <Percent className="w-4 h-4 mr-1" />
      IVA
    </Button>
  );
}