import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/types/project";
import { format } from "date-fns";
import { ProjectCategories } from "./ProjectCategories";

interface ProjectListItemProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectListItem({ project, onUpdateProject, onDeleteProject }: ProjectListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedNumberId, setEditedNumberId] = useState(project.numberId);
  const [editedDate, setEditedDate] = useState(
    project.finalDate ? format(new Date(project.finalDate), 'yyyy-MM-dd') : ''
  );
  const { toast } = useToast();

  const handleSaveEdit = () => {
    onUpdateProject({
      ...project,
      name: editedName,
      numberId: editedNumberId,
      finalDate: editedDate ? new Date(editedDate) : undefined
    });

    setIsEditing(false);

    toast({
      title: "Éxito",
      description: "Proyecto actualizado correctamente",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg border-blue-100">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex gap-2 flex-1">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="border-blue-200 focus:border-blue-400"
            />
            <Input
              type="number"
              value={editedNumberId}
              onChange={(e) => setEditedNumberId(parseInt(e.target.value) || 0)}
              placeholder="Número ID"
              className="border-blue-200 focus:border-blue-400 w-32"
            />
            <Input
              type="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              className="border-blue-200 focus:border-blue-400 w-40"
            />
            <Button onClick={handleSaveEdit} size="sm">
              Guardar
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <span className="font-medium text-primary">{project.name}</span>
            <span className="text-sm text-muted-foreground">ID: {project.numberId}</span>
            {project.finalDate && (
              <span className="text-sm text-muted-foreground">
                Fecha final: {format(new Date(project.finalDate), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        )}
        <div className="space-x-2">
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
        </div>
      </div>

      <ProjectCategories 
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </div>
  );
}