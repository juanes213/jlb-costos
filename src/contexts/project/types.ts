
import { Project } from "@/types/project";

export type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  calculateProjectCost: (project: Project) => {
    totalCost: number;
    margin: number;
    marginPercentage: number;
  };
  isLoading: boolean;
};

export type ProjectContextProviderProps = {
  children: React.ReactNode;
};
