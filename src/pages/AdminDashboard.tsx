import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectHeader } from "@/components/admin/ProjectHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectList } from "@/components/admin/ProjectList";
import type { Category } from "@/types/project";

export default function AdminDashboard() {
  const { projects, addProject, deleteProject, updateProject } = useProjects();

  const handleCreateProject = (name: string, categories: Category[]) => {
    addProject({
      name,
      numberId: Math.floor(Math.random() * 10000),
      categories: categories.map(category => ({
        ...category,
        cost: category.items.length === 0 ? 0 : undefined,
        items: category.items.map(item => ({
          ...item,
          cost: 0
        }))
      })),
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
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
