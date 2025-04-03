
import { Button } from "@/components/ui/button";
import { Pencil, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ProjectStatus } from "../ProjectStatus";
import type { Project, ProjectStatus as ProjectStatusType } from "@/types/project";
import { memo } from "react";

interface ProjectHeaderProps {
  project: Project;
  isExpanded: boolean;
  onStatusChange: (status: ProjectStatusType) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
}

// Use React.memo to prevent unnecessary re-renders
export const ProjectHeader = memo(function ProjectHeader({
  project,
  isExpanded,
  onStatusChange,
  onEdit,
  onDelete,
  onToggleExpand,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex gap-4 items-center flex-wrap flex-1">
        <span className="font-medium text-primary">{project.name}</span>
        <span className="text-sm text-muted-foreground">ID: {project.numberId}</span>
        <span className="text-sm text-muted-foreground">
          Ingreso: {formatCurrency(project.income)}
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
      <div className="flex items-center gap-2 flex-wrap">
        <ProjectStatus
          status={project.status}
          onStatusChange={onStatusChange}
        />
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
        <Button
          onClick={onDelete}
          variant="destructive"
          size="sm"
        >
          <Trash className="w-4 h-4 mr-2" />
          Eliminar
        </Button>
        <Button
          onClick={onToggleExpand}
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
  );
});
