
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface ProjectEditFormProps {
  editedName: string;
  editedNumberId: string;
  editedIncome: string;
  editedInitialDate: string;
  editedFinalDate: string;
  editedObservations: string;
  onNameChange: (value: string) => void;
  onNumberIdChange: (value: string) => void;
  onIncomeChange: (value: string) => void;
  onInitialDateChange: (value: string) => void;
  onFinalDateChange: (value: string) => void;
  onObservationsChange: (value: string) => void;
  onSave: () => void;
}

export function ProjectEditForm({
  editedName,
  editedNumberId,
  editedIncome,
  editedInitialDate,
  editedFinalDate,
  editedObservations,
  onNameChange,
  onNumberIdChange,
  onIncomeChange,
  onInitialDateChange,
  onFinalDateChange,
  onObservationsChange,
  onSave,
}: ProjectEditFormProps) {
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(numericValue) || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-1 flex-wrap">
        <Input
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nombre del proyecto"
          className="border-blue-200 focus:border-blue-400 min-w-[200px]"
        />
        <Input
          value={editedNumberId}
          onChange={(e) => onNumberIdChange(e.target.value)}
          placeholder="ID del proyecto"
          className="border-blue-200 focus:border-blue-400 w-32"
        />
        <Input
          value={editedIncome ? formatCurrency(editedIncome) : ""}
          onChange={(e) => onIncomeChange(e.target.value)}
          placeholder="Ingreso del proyecto"
          className="border-blue-200 focus:border-blue-400 w-40"
        />
        <Input
          type="date"
          value={editedInitialDate}
          onChange={(e) => onInitialDateChange(e.target.value)}
          className="border-blue-200 focus:border-blue-400 w-40"
        />
        <Input
          type="date"
          value={editedFinalDate}
          onChange={(e) => onFinalDateChange(e.target.value)}
          className="border-blue-200 focus:border-blue-400 w-40"
        />
        <Button onClick={onSave} size="sm">
          Guardar
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Observaciones</label>
        <Textarea
          value={editedObservations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Añada observaciones sobre el proyecto"
          className="border-blue-200 focus:border-blue-400"
          rows={3}
        />
      </div>
    </div>
  );
}
