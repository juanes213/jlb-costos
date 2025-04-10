import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Project, ProjectStatus } from "@/types/project";
import { ProjectCategories } from "./ProjectCategories";
import { ProjectHeader } from "./project-item/ProjectHeader";
import { ProjectEditForm } from "./project-item/ProjectEditForm";
import { ProjectObservations } from "./project-item/ProjectObservations";
import { format } from "date-fns";
import { ProjectPersonnel } from "./project-item/ProjectPersonnel";
import { useSearchParams } from "react-router-dom";

interface ProjectListItemProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectListItem({ project, onUpdateProject, onDeleteProject }: ProjectListItemProps) {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const showDetailsParam = searchParams.get("showDetails");
  
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(
    projectIdParam === project.id && showDetailsParam === "true"
  );
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
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (projectIdParam === project.id && showDetailsParam === "true") {
      setIsExpanded(true);
    }
  }, [projectIdParam, showDetailsParam, project.id]);

  const [parsedProject, setParsedProject] = useState<Project>({
    ...project,
    categories: Array.isArray(project.categories) 
      ? project.categories 
      : (typeof project.categories === 'string' ? JSON.parse(project.categories) : [])
  });

  const projectRef = useRef(parsedProject);

  useEffect(() => {
    projectRef.current = {
      ...project,
      categories: Array.isArray(project.categories) 
        ? project.categories 
        : (typeof project.categories === 'string' ? JSON.parse(project.categories) : [])
    };
  }, [project]);

  const handleAddCategory = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 200) return;
    lastUpdateRef.current = now;
    
    const newProject = { ...project };
    
    if (!Array.isArray(newProject.categories) && typeof newProject.categories === 'string') {
      newProject.categories = JSON.parse(newProject.categories);
    } else if (!Array.isArray(newProject.categories)) {
      newProject.categories = [];
    }
    
    newProject.categories = [...newProject.categories, { name: "", items: [] }];
    onUpdateProject(newProject);
  }, [project, onUpdateProject]);

  const handleSaveEdit = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 200) return;
    lastUpdateRef.current = now;
    
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
  }, [
    project, editedName, editedNumberId, editedIncome, 
    editedInitialDate, editedFinalDate, editedObservations, 
    onUpdateProject, toast
  ]);

  const handleIncomeChange = useCallback((value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEditedIncome(numericValue);
  }, []);

  const handleStatusChange = useCallback((status: ProjectStatus) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 200) return;
    lastUpdateRef.current = now;
    
    onUpdateProject({
      ...project,
      status
    });
  }, [project, onUpdateProject]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

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
            onToggleExpand={handleToggleExpand}
          />
          <ProjectObservations observations={project.observations} />
        </>
      )}

      {isExpanded && (
        <div className="pt-4 border-t border-gray-100 animate-accordion-down">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Personal</h3>
            <ProjectPersonnel 
              project={projectRef.current}
              onUpdateProject={onUpdateProject}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Categorías</h3>
            <ProjectCategories 
              project={projectRef.current}
              onUpdateProject={onUpdateProject}
            />

            <Button onClick={handleAddCategory} variant="outline" size="sm" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Añadir categoría
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
