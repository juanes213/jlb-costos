
import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types/project";

type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  calculateProjectCost: (project: Project) => {
    totalCost: number;
    margin: number;
    marginPercentage: number;
  };
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("projects", JSON.stringify(newProjects));
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: crypto.randomUUID(),
    };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (updatedProject: Project) => {
    const newProjects = projects.map((p) =>
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(newProjects);
  };

  const deleteProject = (id: string) => {
    const newProjects = projects.filter((p) => p.id !== id);
    saveProjects(newProjects);
  };

  const calculateProjectCost = (project: Project) => {
    let totalCost = 0;

    // Calculate cost for each category except "Personal"
    project.categories.forEach(category => {
      if (category.name !== "Personal") {
        // Add category base cost if it exists
        if (category.cost) {
          totalCost += category.cost;
        }
        
        // Add cost of each item
        category.items.forEach(item => {
          const itemCost = item.cost * (item.quantity || 1);
          totalCost += itemCost;
          
          // Add IVA if it exists
          if (item.ivaAmount) {
            totalCost += item.ivaAmount;
          }
        });
      }
    });

    const margin = project.income - totalCost;
    const marginPercentage = totalCost > 0 ? (margin / totalCost) * 100 : 0;

    return { totalCost, margin, marginPercentage };
  };

  return (
    <ProjectContext.Provider
      value={{ projects, addProject, updateProject, deleteProject, calculateProjectCost }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
