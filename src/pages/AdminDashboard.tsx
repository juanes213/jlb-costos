
import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectHeader } from "@/components/admin/ProjectHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectList } from "@/components/admin/ProjectList";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject, isLoading } = useProjects();
  const [searchId, setSearchId] = useState("");
  const { toast } = useToast();

  const handleCreateProject = (name: string, numberId: string, initialDate?: Date, finalDate?: Date, income?: number) => {
    addProject({
      name,
      numberId,
      income: income || 0,
      categories: [
        { name: "Insumos", items: [] },
        { name: "Transporte", items: [] },
        { name: "Viáticos", items: [] },
        { name: "Imprevistos", items: [] }
      ],
      status: "on-hold", // Default status is "on-hold" (waiting)
      initialDate,
      finalDate,
    });
  };

  // Add a function to recreate default categories for all projects
  const handleRepairProjects = () => {
    const defaultCategories = [
      { name: "Insumos", items: [] },
      { name: "Transporte", items: [] },
      { name: "Viáticos", items: [] },
      { name: "Imprevistos", items: [] }
    ];

    let repairedCount = 0;

    projects.forEach(project => {
      // Check if the project's categories are corrupted (not an array or empty)
      let shouldRepair = false;
      
      if (!project.categories) {
        shouldRepair = true;
      } else if (typeof project.categories === 'string') {
        try {
          const parsed = JSON.parse(project.categories);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            shouldRepair = true;
          }
        } catch (e) {
          shouldRepair = true;
        }
      } else if (!Array.isArray(project.categories) || project.categories.length === 0) {
        shouldRepair = true;
      }
      
      // If categories need repair, update the project
      if (shouldRepair) {
        updateProject({
          ...project,
          categories: defaultCategories
        });
        repairedCount++;
      }
    });
    
    toast({
      title: "Reparación Completada",
      description: `Se repararon ${repairedCount} proyectos con categorías faltantes o dañadas.`
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Proyectos Existentes</h2>
            <Button 
              onClick={handleRepairProjects} 
              variant="outline" 
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              Reparar Categorías de Proyectos
            </Button>
          </div>
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
