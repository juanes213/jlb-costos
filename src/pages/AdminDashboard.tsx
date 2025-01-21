import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectHeader } from "@/components/admin/ProjectHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectList } from "@/components/admin/ProjectList";
import type { Category } from "@/types/project";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject } = useProjects();

  const handleCreateProject = (name: string, numberId: string, categories: Category[], initialDate?: Date, finalDate?: Date) => {
    addProject({
      name,
      numberId,
      categories: categories.map(category => ({
        ...category,
        cost: category.items.length === 0 ? 0 : undefined,
        items: category.items.map(item => ({
          ...item,
          cost: 0
        }))
      })),
      status: "in-process",
      initialDate,
      finalDate,
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/70cafcc8-321e-4b6c-8dbf-402cf4fd2c74.png" 
            alt="JL Bedoya Group Logo" 
            className="h-12"
          />
          <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
        </div>
      </div>

      <ProjectHeader />

      <Card className="p-6 space-y-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold text-primary">Agregar Proyecto</h2>
        <ProjectForm onCreateProject={handleCreateProject} />
      </Card>

      <Card className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Proyectos Existentes</h2>
        <ProjectList
          projects={projects}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      </Card>
    </div>
  );
}
