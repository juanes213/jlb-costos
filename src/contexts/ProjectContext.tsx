
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

  // Check and update project status based on dates
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedProjects = projects.map(project => {
      let updatedStatus = project.status;

      // Check if initial date has arrived and project is in waiting status
      if (project.initialDate && project.status === "on-hold") {
        const initialDate = new Date(project.initialDate);
        initialDate.setHours(0, 0, 0, 0);
        
        if (initialDate <= today) {
          updatedStatus = "in-process";
        }
      }

      // Check if final date has arrived and project is in progress
      if (project.finalDate && project.status === "in-process") {
        const finalDate = new Date(project.finalDate);
        finalDate.setHours(0, 0, 0, 0);
        
        if (finalDate <= today) {
          updatedStatus = "completed";
        }
      }

      // Return the project with updated status if it has changed
      if (updatedStatus !== project.status) {
        return { ...project, status: updatedStatus };
      }
      return project;
    });

    // Only save if there are actually changes
    if (JSON.stringify(updatedProjects) !== JSON.stringify(projects)) {
      saveProjects(updatedProjects);
    }
  }, [projects]);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("projects", JSON.stringify(newProjects));
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: crypto.randomUUID(),
      // Ensure dates are preserved as Date objects
      initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
      finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
    };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (updatedProject: Project) => {
    const newProjects = projects.map((p) =>
      p.id === updatedProject.id ? {
        ...updatedProject,
        // Ensure dates are preserved as Date objects
        initialDate: updatedProject.initialDate ? new Date(updatedProject.initialDate) : undefined,
        finalDate: updatedProject.finalDate ? new Date(updatedProject.finalDate) : undefined,
      } : p
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
