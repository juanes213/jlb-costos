
import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types/project";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

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
  isLoading: boolean;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// A central storage key that's app-wide, not user-specific
const PROJECTS_STORAGE_KEY = "jlb_projects_v1";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Load projects from Supabase or localStorage when user changes
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch projects from Supabase
        const { data: supabaseProjects, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) {
          console.error("Error fetching projects from Supabase:", error);
          // Fall back to localStorage
          fallbackToLocalStorage();
          return;
        }
        
        if (supabaseProjects && supabaseProjects.length > 0) {
          // Convert Supabase projects to our Project type
          const formattedProjects: Project[] = supabaseProjects.map(project => ({
            id: project.id,
            name: project.name,
            numberId: project.numberId,
            status: project.status,
            initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
            finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
            income: project.income,
            categories: project.categories as any,
            observations: project.observations || undefined
          }));
          
          setProjects(formattedProjects);
          console.log("Projects loaded from Supabase:", formattedProjects);
        } else {
          // If no projects in Supabase, check localStorage and migrate if needed
          const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
          
          if (storedProjects && user.role === 'admin') {
            // Parse the projects from localStorage
            const parsedProjects = JSON.parse(storedProjects);
            
            // Convert date strings back to Date objects
            const projectsWithDates = parsedProjects.map((project: any) => ({
              ...project,
              initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
              finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
            }));
            
            // Migrate localStorage projects to Supabase
            for (const project of projectsWithDates) {
              await supabase.from('projects').insert({
                id: project.id,
                name: project.name,
                numberId: project.numberId || '',
                status: project.status,
                initialDate: project.initialDate ? project.initialDate.toISOString() : null,
                finalDate: project.finalDate ? project.finalDate.toISOString() : null,
                income: project.income || 0,
                categories: project.categories,
                observations: project.observations || null,
                created_at: new Date().toISOString(),
                created_by: user.id
              });
            }
            
            setProjects(projectsWithDates);
            console.log("Projects migrated from localStorage to Supabase:", projectsWithDates);
          } else {
            setProjects([]);
          }
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        // Fall back to localStorage
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fallbackToLocalStorage = () => {
      try {
        const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (storedProjects) {
          // Parse the projects from localStorage
          const parsedProjects = JSON.parse(storedProjects);
          
          // Convert date strings back to Date objects
          const projectsWithDates = parsedProjects.map((project: any) => ({
            ...project,
            initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
            finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
          }));
          
          setProjects(projectsWithDates);
          console.log("Projects loaded from localStorage fallback:", projectsWithDates);
        }
      } catch (error) {
        console.error("Error loading projects from localStorage:", error);
      }
    };
    
    loadProjects();
  }, [user]);

  // Check and update project status based on dates
  useEffect(() => {
    if (isLoading || projects.length === 0) return;
    
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
  }, [projects, isLoading]);

  const saveProjects = async (newProjects: Project[]) => {
    try {
      setProjects(newProjects);
      
      if (user) {
        // Save to Supabase
        for (const project of newProjects) {
          const supabaseProject = {
            id: project.id,
            name: project.name,
            numberId: project.numberId || '',
            status: project.status,
            initialDate: project.initialDate ? project.initialDate.toISOString() : null,
            finalDate: project.finalDate ? project.finalDate.toISOString() : null,
            income: project.income || 0,
            categories: project.categories,
            observations: project.observations || null,
            created_by: user.id
          };
          
          const { error } = await supabase
            .from('projects')
            .upsert(supabaseProject);
            
          if (error) {
            console.error("Error saving project to Supabase:", error);
            // Fall back to localStorage
            saveToLocalStorage(newProjects);
          }
        }
        
        console.log("Projects saved to Supabase:", newProjects);
      } else {
        // Fall back to localStorage if user is not available
        saveToLocalStorage(newProjects);
      }
    } catch (error) {
      console.error("Error saving projects:", error);
      // Fall back to localStorage
      saveToLocalStorage(newProjects);
    }
  };
  
  const saveToLocalStorage = (newProjects: Project[]) => {
    try {
      // Use a more consistent format for saving to localStorage
      const projectsToSave = JSON.stringify(newProjects, (key, value) => {
        // Handle Date objects explicitly
        if (key === 'initialDate' || key === 'finalDate') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      
      localStorage.setItem(PROJECTS_STORAGE_KEY, projectsToSave);
      console.log("Projects saved to localStorage with key:", PROJECTS_STORAGE_KEY, newProjects);
    } catch (error) {
      console.error("Error saving projects to localStorage:", error);
    }
  };

  const addProject = async (project: Omit<Project, "id">) => {
    try {
      if (isLoading) return;
      
      const newProject = {
        ...project,
        id: crypto.randomUUID(),
        // Ensure dates are preserved as Date objects
        initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
        finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
      };
      
      saveProjects([...projects, newProject]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      if (isLoading) return;
      
      const newProjects = projects.map((p) =>
        p.id === updatedProject.id ? {
          ...updatedProject,
          // Ensure dates are preserved as Date objects
          initialDate: updatedProject.initialDate ? new Date(updatedProject.initialDate) : undefined,
          finalDate: updatedProject.finalDate ? new Date(updatedProject.finalDate) : undefined,
        } : p
      );
      
      saveProjects(newProjects);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      if (isLoading) return;
      
      const newProjects = projects.filter((p) => p.id !== id);
      
      // Delete from Supabase
      if (user) {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Error deleting project from Supabase:", error);
        }
      }
      
      saveProjects(newProjects);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
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
      value={{ projects, addProject, updateProject, deleteProject, calculateProjectCost, isLoading }}
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
