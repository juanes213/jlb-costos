import type { Project } from "@/types/project";
import { ProjectListItem } from "./ProjectListItem";

interface ProjectListProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectList({ projects, onUpdateProject, onDeleteProject }: ProjectListProps) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  );
}