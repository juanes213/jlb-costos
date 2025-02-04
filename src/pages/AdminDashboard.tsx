
import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectHeader } from "@/components/admin/ProjectHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectList } from "@/components/admin/ProjectList";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject } = useProjects();
  const [searchId, setSearchId] = useState("");

  const handleCreateProject = (name: string, numberId: string, initialDate?: Date, finalDate?: Date, income?: number) => {
    addProject({
      name,
      numberId,
      income: income || 0,
      categories: [
        { name: "Insumos", items: [] },
        { name: "Transporte", items: [] },
        { name: "Imprevistos", items: [] }
      ],
      status: "in-process",
      initialDate,
      finalDate,
    });
  };

  const filteredProjects = projects.filter(project => 
    project.numberId.toLowerCase().includes(searchId.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/70cafcc8-321e-4b6c-8dbf-402cf4fd2c74.png" 
            alt="JL Bedoya Group Logo" 
            className="h-12"
          />
        </div>
      </div>

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
  );
}
