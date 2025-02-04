
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, ProjectStatus } from "@/types/project";
import { format } from "date-fns";
import { ProjectCategories } from "./ProjectCategories";
import { ProjectStatus as ProjectStatusComponent } from "./ProjectStatus";

interface ProjectListItemProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectListItem({ project, onUpdateProject, onDeleteProject }: ProjectListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedNumberId, setEditedNumberId] = useState(project.numberId);
  const [editedIncome, setEditedIncome] = useState(project.income.toString());
  const [editedInitialDate, setEditedInitialDate] = useState(
    project.initialDate ? format(new Date(project.initialDate), 'yyyy-MM-dd') : ''
  );
  const [editedFinalDate, setEditedFinalDate] = useState(
    project.finalDate ? format(new Date(project.finalDate), 'yyyy-MM-dd') : ''
  );
  const { toast } = useToast();

  const handleAddCategory = () => {
    const newProject = { ...project };
    newProject.categories = [...newProject.categories, { name: "", items: [] }];
    onUpdateProject(newProject);
  };

  const handleSaveEdit = () => {
    onUpdateProject({
      ...project,
      name: editedName,
      numberId: editedNumberId,
      income: parseFloat(editedIncome) || 0,
      initialDate: editedInitialDate ? new Date(editedInitialDate) : undefined,
      finalDate: editedFinalDate ? new Date(editedFinalDate) : undefined
    });

    setIsEditing(false);

    toast({
      title: "Éxito",
      description: "Proyecto actualizado correctamente",
    });
  };

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
    setEditedIncome(numericValue);
  };

  const handleStatusChange = (status: ProjectStatus) => {
    onUpdateProject({
      ...project,
      status
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg border-blue-100 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {isEditing ? (
          <div className="flex gap-2 flex-1 flex-wrap">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="border-blue-200 focus:border-blue-400 min-w-[200px]"
            />
            <Input
              value={editedNumberId}
              onChange={(e) => setEditedNumberId(e.target.value)}
              placeholder="ID del proyecto"
              className="border-blue-200 focus:border-blue-400 w-32"
            />
            <Input
              value={editedIncome ? formatCurrency(editedIncome) : ""}
              onChange={(e) => handleIncomeChange(e.target.value)}
              placeholder="Ingreso del proyecto"
              className="border-blue-200 focus:border-blue-400 w-40"
            />
            <Input
              type="date"
              value={editedInitialDate}
              onChange={(e) => setEditedInitialDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400 w-40"
            />
            <Input
              type="date"
              value={editedFinalDate}
              onChange={(e) => setEditedFinalDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400 w-40"
            />
            <Button onClick={handleSaveEdit} size="sm">
              Guardar
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 items-center flex-wrap flex-1">
            <span className="font-medium text-primary">{project.name}</span>
            <span className="text-sm text-muted-foreground">ID: {project.numberId}</span>
            <span className="text-sm text-muted-foreground">
              Ingreso: {formatCurrency(project.income.toString())}
            </span>
            {project.initialDate && (
              <span className="text-sm text-muted-foreground">
                Fecha inicial: {format(new Date(project.initialDate), 'dd/MM/yyyy')}
              </span>
            )}
            {project.finalDate && (
              <span className="text-sm text-muted-foreground">
                Fecha final: {format(new Date(project.finalDate), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectStatusComponent
            status={project.status}
            onStatusChange={handleStatusChange}
          />
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
          <Button
            onClick={() => onDeleteProject(project.id)}
            variant="destructive"
            size="sm"
          >
            <Trash className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 mr-2" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            {isExpanded ? "Ocultar detalles" : "Ver detalles"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-4 border-t border-gray-100 animate-accordion-down">
          <ProjectCategories 
            project={project}
            onUpdateProject={onUpdateProject}
          />

          <Button onClick={handleAddCategory} variant="outline" size="sm" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Añadir categoría
          </Button>
        </div>
      )}
    </div>
  );
}
