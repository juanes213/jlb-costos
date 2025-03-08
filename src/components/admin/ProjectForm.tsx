
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ProjectFormProps {
  onCreateProject: (name: string, numberId: string, initialDate?: Date, finalDate?: Date, income?: number, observations?: string) => void;
}

export function ProjectForm({ onCreateProject }: ProjectFormProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [initialDate, setInitialDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [income, setIncome] = useState("");
  const [observations, setObservations] = useState("");
  const { toast } = useToast();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(numericValue) || 0);
  };

  const handleIncomeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setIncome(numericValue);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proyecto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!projectId.trim()) {
      toast({
        title: "Error",
        description: "El ID del proyecto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    onCreateProject(
      newProjectName,
      projectId,
      initialDate ? new Date(initialDate) : undefined,
      finalDate ? new Date(finalDate) : undefined,
      income ? parseFloat(income) : 0,
      observations.trim() || undefined
    );
    
    setNewProjectName("");
    setProjectId("");
    setInitialDate("");
    setFinalDate("");
    setIncome("");
    setObservations("");

    toast({
      title: "Éxito",
      description: "Proyecto creado con éxito",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del Proyecto</label>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Introduzca el nombre del proyecto"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ID del Proyecto</label>
          <Input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Introduzca el ID del proyecto"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ingreso del Proyecto</label>
          <Input
            value={income ? formatCurrency(income) : ""}
            onChange={(e) => handleIncomeChange(e.target.value)}
            placeholder="$0"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicial</label>
            <Input
              type="date"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fecha Final</label>
            <Input
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observaciones</label>
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Añada observaciones sobre el proyecto"
            className="border-blue-200 focus:border-blue-400"
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleCreateProject} className="w-full">
        Crear proyecto
      </Button>
    </div>
  );
}
