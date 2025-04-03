import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@/types/project";
import { useAuth } from "@/contexts/auth";
import { supabase, throttledRequest } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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

const PROJECTS_STORAGE_KEY = "jlb_projects_v1";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const pendingSaves = useRef<Set<string>>(new Set());
  const lastSavedProjects = useRef<string>("");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckEnabledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        
        console.log("Fetching projects for user:", user.id);
        const { data: supabaseProjects, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) {
          console.error("Error fetching projects from Supabase:", error);
          fallbackToLocalStorage();
          return;
        }
        
        if (supabaseProjects && supabaseProjects.length > 0) {
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
          
          // Store the stringified state to compare for changes later
          lastSavedProjects.current = JSON.stringify(formattedProjects, (key, value) => {
            if (key === 'initialDate' || key === 'finalDate') {
              return value instanceof Date ? value.toISOString() : value;
            }
            return value;
          });
          
          localStorage.setItem(PROJECTS_STORAGE_KEY, lastSavedProjects.current);
        } else {
          const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
          
          if (storedProjects) {
            const parsedProjects = JSON.parse(storedProjects);
            const projectsWithDates = parsedProjects.map((project: any) => ({
              ...project,
              initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
              finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
            }));
            
            // Removed role-based condition, all users can migrate projects
            console.log("Migrating projects from localStorage to Supabase");
            for (const project of projectsWithDates) {
              const { error: insertError } = await supabase.from('projects').insert({
                id: project.id,
                name: project.name,
                numberId: project.numberId || '',
                status: project.status,
                initialDate: project.initialDate ? project.initialDate.toISOString() : null,
                finalDate: project.finalDate ? project.finalDate.toISOString() : null,
                income: project.income || 0,
                categories: project.categories,
                observations: project.observations || null,
                created_at: new Date().toISOString()
              });
              
              if (insertError) {
                console.error("Error migrating project to Supabase:", insertError);
              }
            }
            
            setProjects(projectsWithDates);
            // Store the stringified state to compare for changes later
            lastSavedProjects.current = JSON.stringify(projectsWithDates, (key, value) => {
              if (key === 'initialDate' || key === 'finalDate') {
                return value instanceof Date ? value.toISOString() : value;
              }
              return value;
            });
            console.log("Projects loaded from localStorage:", projectsWithDates);
          } else {
            setProjects([]);
          }
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
        // Enable status checks after initial load is complete
        setTimeout(() => {
          statusCheckEnabledRef.current = true;
        }, 1000);
      }
    };
    
    const fallbackToLocalStorage = () => {
      try {
        const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
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

  // Separate effect for status checks to avoid conflicts with updates
  useEffect(() => {
    // Skip status check if not enabled yet or if loading
    if (!statusCheckEnabledRef.current || isLoading || projects.length === 0) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedProjects = projects.map(project => {
      let updatedStatus = project.status;

      if (project.initialDate && project.status === "on-hold") {
        const initialDate = new Date(project.initialDate);
        initialDate.setHours(0, 0, 0, 0);
        
        if (initialDate <= today) {
          updatedStatus = "in-process";
        }
      }

      if (project.finalDate && project.status === "in-process") {
        const finalDate = new Date(project.finalDate);
        finalDate.setHours(0, 0, 0, 0);
        
        if (finalDate <= today) {
          updatedStatus = "completed";
        }
      }

      if (updatedStatus !== project.status) {
        return { ...project, status: updatedStatus };
      }
      return project;
    });

    // Only save if there's an actual status change, avoiding unnecessary updates
    const currentProjectsStr = JSON.stringify(updatedProjects, (key, value) => {
      if (key === 'initialDate' || key === 'finalDate') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    });
    
    if (currentProjectsStr !== lastSavedProjects.current) {
      console.log("Status check triggered an update");
      saveProjects(updatedProjects);
    }
  }, [projects, isLoading]);

  const saveProjects = useCallback(async (newProjects: Project[]) => {
    try {
      // Prevent redundant updates by comparing with last saved state
      const newProjectsStr = JSON.stringify(newProjects, (key, value) => {
        if (key === 'initialDate' || key === 'finalDate') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      
      if (newProjectsStr === lastSavedProjects.current) {
        console.log("No changes detected, skipping save");
        return;
      }
      
      // Clear any existing timeout to debounce rapid updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Debounce the update to prevent multiple rapid saves
      updateTimeoutRef.current = setTimeout(() => {
        setProjects(newProjects);
        lastSavedProjects.current = newProjectsStr;
        
        saveToLocalStorage(newProjects);
        
        if (user) {
          console.log("Saving projects to Supabase:", newProjects);
          for (const project of newProjects) {
            if (pendingSaves.current.has(project.id)) {
              console.log(`Skipping duplicate save for project ${project.id}`);
              continue;
            }
            
            pendingSaves.current.add(project.id);
            
            const supabaseProject = {
              id: project.id,
              name: project.name,
              numberId: project.numberId || '',
              status: project.status,
              initialDate: project.initialDate ? project.initialDate.toISOString() : null,
              finalDate: project.finalDate ? project.finalDate.toISOString() : null,
              income: project.income || 0,
              categories: project.categories,
              observations: project.observations || null
            };
            
            throttledRequest(async () => {
              try {
                const { error } = await supabase
                  .from('projects')
                  .upsert(supabaseProject, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                  });
                  
                if (error) {
                  console.error("Error saving project to Supabase:", error, supabaseProject);
                  toast({
                    title: "Error",
                    description: "No se pudo guardar el proyecto en la base de datos.",
                    variant: "destructive"
                  });
                } else {
                  console.log("Project saved to Supabase successfully:", supabaseProject.id);
                }
              } catch (error) {
                console.error("Error in throttled request:", error);
              } finally {
                pendingSaves.current.delete(project.id);
              }
            }).catch(error => {
              console.error("Failed to queue project save request:", error);
              pendingSaves.current.delete(project.id);
            });
          }
        }
        
        updateTimeoutRef.current = null;
      }, 300); // Debounce for 300ms
      
    } catch (error) {
      console.error("Error saving projects:", error);
      saveToLocalStorage(newProjects);
    }
  }, [user, toast]);
  
  const saveToLocalStorage = useCallback((newProjects: Project[]) => {
    try {
      const projectsToSave = JSON.stringify(newProjects, (key, value) => {
        if (key === 'initialDate' || key === 'finalDate') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      
      localStorage.setItem(PROJECTS_STORAGE_KEY, projectsToSave);
      console.log("Projects saved to localStorage with key:", PROJECTS_STORAGE_KEY);
    } catch (error) {
      console.error("Error saving projects to localStorage:", error);
    }
  }, []);

  const addProject = async (project: Omit<Project, "id">) => {
    try {
      if (isLoading) return;
      
      const newProject = {
        ...project,
        id: crypto.randomUUID(),
        initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
        finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
      };
      
      console.log("Adding new project:", newProject);
      saveProjects([...projects, newProject]);
      
      toast({
        title: "Éxito",
        description: "Proyecto creado correctamente"
      });
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Error al crear el proyecto",
        variant: "destructive"
      });
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      if (isLoading) return;
      
      const newProjects = projects.map((p) =>
        p.id === updatedProject.id ? {
          ...updatedProject,
          initialDate: updatedProject.initialDate ? new Date(updatedProject.initialDate) : undefined,
          finalDate: updatedProject.finalDate ? new Date(updatedProject.finalDate) : undefined,
        } : p
      );
      
      console.log("Updating project:", updatedProject);
      saveProjects(newProjects);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el proyecto",
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      if (isLoading) return;
      
      const newProjects = projects.filter((p) => p.id !== id);
      
      if (user) {
        console.log("Deleting project from Supabase:", id);
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Error deleting project from Supabase:", error);
          toast({
            title: "Error",
            description: "No se pudo eliminar el proyecto de la base de datos",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Éxito",
            description: "Proyecto eliminado correctamente"
          });
        }
      }
      
      saveProjects(newProjects);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el proyecto",
        variant: "destructive"
      });
    }
  };

  const calculateProjectCost = (project: Project) => {
    let totalCost = 0;

    project.categories.forEach(category => {
      if (category.name !== "Personal") {
        if (category.cost) {
          totalCost += category.cost;
        }
        
        category.items.forEach(item => {
          const itemCost = item.cost * (item.quantity || 1);
          totalCost += itemCost;
          
          if (item.ivaAmount) {
            totalCost += item.ivaAmount;
          }
        });
      }
    });
    
    const personalCategory = project.categories.find(cat => cat.name === "Personal");
    if (personalCategory) {
      personalCategory.items.forEach(item => {
        if (item.name === "Horas extras" && item.overtimeRecords) {
          item.overtimeRecords.forEach(record => {
            totalCost += record.cost;
          });
        } else {
          const itemCost = item.cost * (item.quantity || 1);
          totalCost += itemCost;
        }
      });
    }

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
