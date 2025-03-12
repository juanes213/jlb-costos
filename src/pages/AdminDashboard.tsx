
import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectHeader } from "@/components/admin/ProjectHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectList } from "@/components/admin/ProjectList";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject, isLoading } = useProjects();
  const [searchId, setSearchId] = useState("");

  const handleCreateProject = (name: string, numberId: string, initialDate?: Date, finalDate?: Date, income?: number) => {
    addProject({
      name,
      numberId,
      income: income || 0,
      categories: [
        { name: "Insumos", items: [] },
        { name: "Transporte", items: [] },
        { name: "Viáticos", items: [] },
        { name: "Imprevistos", items: [] },
        { name: "Personal", items: [] }
      ],
      status: "on-hold", // Default status is "on-hold" (waiting)
      initialDate,
      finalDate,
    });
  };

  const filteredProjects = projects.filter(project => 
    project.numberId?.toLowerCase().includes((searchId || '').toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 flex justify-center items-center h-[70vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 space-y-8 animate-fadeIn">
        <ProjectHeader />

        <Card className="p-6 space-y-6 bg-white shadow-md">
          <h2 className="text-xl font-semibold text-primary">Agregar Proyecto</h2>
          <ProjectForm onCreateProject={handleCreateProject} />
        </Card>

        <Card className="p-6 bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Proyectos Existentes</h2>
          <div className="mb-4">
            <Input
              placeholder="Buscar por ID del proyecto..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="max-w-sm border-blue-200 focus:border-blue-400"
            />
          </div>
          <ProjectList
            projects={filteredProjects}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        </Card>
      </div>
    </div>
  );
}
