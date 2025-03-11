
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, ProjectStatus } from "@/types/project";
import { ProjectCategories } from "./ProjectCategories";
import { ProjectHeader } from "./project-item/ProjectHeader";
import { ProjectEditForm } from "./project-item/ProjectEditForm";
import { ProjectObservations } from "./project-item/ProjectObservations";
import { format } from "date-fns";

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
  const [editedObservations, setEditedObservations] = useState(project.observations || "");
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
      finalDate: editedFinalDate ? new Date(editedFinalDate) : undefined,
      observations: editedObservations || undefined
    });

    setIsEditing(false);

    toast({
      title: "Éxito",
      description: "Proyecto actualizado correctamente",
    });
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
      {isEditing ? (
        <ProjectEditForm
          editedName={editedName}
          editedNumberId={editedNumberId}
          editedIncome={editedIncome}
          editedInitialDate={editedInitialDate}
          editedFinalDate={editedFinalDate}
          editedObservations={editedObservations}
          onNameChange={setEditedName}
          onNumberIdChange={setEditedNumberId}
          onIncomeChange={handleIncomeChange}
          onInitialDateChange={setEditedInitialDate}
          onFinalDateChange={setEditedFinalDate}
          onObservationsChange={setEditedObservations}
          onSave={handleSaveEdit}
        />
      ) : (
        <>
          <ProjectHeader
            project={project}
            isExpanded={isExpanded}
            onStatusChange={handleStatusChange}
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDeleteProject(project.id)}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
          <ProjectObservations observations={project.observations} />
        </>
      )}

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
