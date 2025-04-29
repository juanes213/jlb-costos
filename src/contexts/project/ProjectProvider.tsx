import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase, throttledRequest } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";
import { 
  ProjectContextType,
  ProjectContextProviderProps 
} from "./types";
import { 
  PROJECTS_STORAGE_KEY,
  parseProjectData,
  formatProjectForSupabase,
  stringifyProjects,
  calculateProjectCost as calculateCost
} from "./utils";
import { useProjectNotifications, useProjectPersistence } from "./hooks";
import { ProjectContext } from "./context";

// Recovered project data
const recoveredProjects = [{"name":"Transelca - Valledupar","numberId":"BVAR-24-229","income":43200000,"categories":[{"name":"Insumos","items":[{"name":"Nitrogeno","cost":140000,"quantity":2,"unit":"unidad"},{"name":"Trapos","cost":15000,"quantity":3,"unit":"k"},{"name":"Wypall","cost":34000,"quantity":1,"unit":"rollo"},{"name":"Alcohol","cost":38000,"quantity":1,"unit":"galon"},{"name":"Papel Oleofilico","cost":2000,"quantity":30,"unit":"Hoja"}]},{"name":"Transporte","items":[{"name":"Camioneta","cost":180000,"quantity":3},{"name":"Combustible","cost":200000,"quantity":2},{"name":"Bus","cost":65000,"quantity":4},{"name":"Taxi","cost":20000,"quantity":4},{"name":"Peaje","cost":18000,"quantity":10},{"name":"Alquiler grua","cost":4000000,"quantity":2},{"name":"Transporte de equipo","cost":2000000,"quantity":2}]},{"name":"Imprevistos","items":[],"cost":800000},{"name":"Viáticos","items":[{"name":"Hotel","cost":65000,"quantity":12},{"name":"Desayuno","cost":15000,"quantity":18},{"name":"Almuerzo","cost":15000,"quantity":18},{"name":"Cena","cost":15000,"quantity":12},{"name":"Dispensador","cost":300000,"quantity":1},{"name":"Botellón de agua","cost":15000,"quantity":3}]},{"name":"Personal","items":[{"name":"Técnicos","cost":2250000,"quantity":1}]}],"status":"on-hold","initialDate":"2025-03-08T00:00:00.000Z","finalDate":"2025-03-10T00:00:00.000Z","id":"63fd8582-fcbf-496e-b356-53efdd766fb8"},{"name":"Klarens - Valledupar","numberId":"VAR-05-005","income":34190000,"categories":[{"name":"Insumos","items":[{"name":"Nitrogeno","cost":140000,"quantity":3,"unit":"unidad"},{"name":"WD-40","cost":45000,"quantity":8,"unit":"unidad"},{"name":"Alcohol","cost":38000,"quantity":2,"unit":"galon"},{"name":"Wypall","cost":34000,"quantity":3,"unit":"rollo"},{"name":"Trapos","cost":15000,"quantity":5,"unit":"k"},{"name":"Cinta aislante 33","cost":19000,"quantity":1,"unit":"unidad"},{"name":"Cinta aislante 23","cost":45000,"quantity":1,"unit":"unidad"},{"name":"Cinta de silicona 70","cost":325000,"quantity":1,"unit":"unidad"},{"name":"Cinta de colores","cost":7000,"quantity":5,"unit":"unidad"},{"name":"Pintura Epóxica","cost":350000,"quantity":1,"unit":"galon"},{"name":"Thinner Epóxico","cost":78900,"quantity":1,"unit":"galon"},{"name":"Thinner Corriente","cost":25000,"quantity":1,"unit":"galon"},{"name":"Anticorrosivo Epóxico","cost":218500,"quantity":1,"unit":"galon"},{"name":"Lijas 240","cost":2000,"quantity":3,"unit":"pliego"},{"name":"Cinta Enmascarar","cost":5000,"quantity":2,"unit":"unidad"},{"name":"Calcomanias","cost":100000,"quantity":1,"unit":"global"}]},{"name":"Transporte","items":[{"name":"Maquinaria","cost":1500000,"quantity":1},{"name":"Personal ","cost":70000,"quantity":6},{"name":"Taxi","cost":20000,"quantity":6},{"name":"Taxi local valledupar","cost":20000,"quantity":6}]},{"name":"Imprevistos","items":[],"cost":800000},{"name":"Viáticos","items":[{"name":"Hotel","cost":70000,"quantity":14},{"name":"Almuerzo","cost":15000,"quantity":21},{"name":"Desayuno","cost":15000,"quantity":7},{"name":"Cena","cost":15000,"quantity":14},{"name":"hidratación","cost":150000,"quantity":1}]}],"status":"on-hold","initialDate":"2025-03-08T00:00:00.000Z","finalDate":"2025-03-10T00:00:00.000Z","id":"607ccb24-8c82-4ee0-8909-e3fe97add857"}];

export function ProjectProvider({ children }: ProjectContextProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const pendingSaves = useRef<Set<string>>(new Set());
  const lastSavedProjects = useRef<string>("");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckEnabledRef = useRef<boolean>(false);
  const recoveredDataLoadedRef = useRef<boolean>(false);
  
  const sendProjectNotification = useProjectNotifications();
  const { saveToLocalStorage } = useProjectPersistence(toast);

  // Function to import the recovered project data
  const importRecoveredProjects = useCallback(async () => {
    try {
      if (recoveredDataLoadedRef.current) return;
      
      console.log("Importing recovered project data");
      const existingIds = new Set(projects.map(p => p.id));
      
      // Filter out projects that already exist
      const newProjects = recoveredProjects.filter(p => !existingIds.has(p.id));
      
      if (newProjects.length === 0) {
        console.log("No new projects to import");
        return;
      }
      
      console.log(`Importing ${newProjects.length} recovered projects`);
      
      // Format projects for Supabase and save them
      for (const rawProject of newProjects) {
        // Convert string dates to proper Date objects before processing
        const projectWithDates = {
          ...rawProject,
          initialDate: rawProject.initialDate ? new Date(rawProject.initialDate) : undefined,
          finalDate: rawProject.finalDate ? new Date(rawProject.finalDate) : undefined
        };
        
        // Now it's safe to use as Project type
        const project = projectWithDates as unknown as Project;
        
        const formattedProject = formatProjectForSupabase(project);
        console.log("Saving recovered project to Supabase:", formattedProject);
        
        const { error } = await supabase
          .from('projects')
          .upsert(formattedProject, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
          
        if (error) {
          console.error("Error saving recovered project to Supabase:", error);
        } else {
          console.log("Recovered project saved to Supabase:", formattedProject.id);
        }
      }
      
      // Update the local state to include the recovered projects with proper date conversion
      setProjects(prev => {
        const updatedProjects = [...prev];
        newProjects.forEach(rawProject => {
          if (!existingIds.has(rawProject.id)) {
            // Convert string dates to Date objects
            const projectWithDates = {
              ...rawProject,
              initialDate: rawProject.initialDate ? new Date(rawProject.initialDate) : undefined,
              finalDate: rawProject.finalDate ? new Date(rawProject.finalDate) : undefined
            };
            
            updatedProjects.push(projectWithDates as unknown as Project);
          }
        });
        return updatedProjects;
      });
      
      recoveredDataLoadedRef.current = true;
      
      toast({
        title: "Datos Recuperados",
        description: `Se han importado ${newProjects.length} proyectos recuperados.`
      });
    } catch (error) {
      console.error("Error importing recovered projects:", error);
      toast({
        title: "Error",
        description: "No se pudieron importar los datos recuperados",
        variant: "destructive"
      });
    }
  }, [projects, toast]);

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
          const formattedProjects: Project[] = supabaseProjects.map(project => 
            parseProjectData(project)
          );
          
          setProjects(formattedProjects);
          console.log("Projects loaded from Supabase:", formattedProjects);
          
          lastSavedProjects.current = stringifyProjects(formattedProjects);
          localStorage.setItem(PROJECTS_STORAGE_KEY, lastSavedProjects.current);
        } else {
          console.log("No projects found in Supabase, checking localStorage");
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          statusCheckEnabledRef.current = true;
        }, 1000);
        
        // Import recovered data after initial load
        importRecoveredProjects();
      }
    };
    
    const fallbackToLocalStorage = () => {
      try {
        const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (storedProjects) {
          try {
            const parsedProjects = JSON.parse(storedProjects);
            const projectsWithDates = parsedProjects.map((project: any) => ({
              ...project,
              initialDate: project.initialDate ? new Date(project.initialDate) : undefined,
              finalDate: project.finalDate ? new Date(project.finalDate) : undefined,
              categories: typeof project.categories === 'string' 
                ? JSON.parse(project.categories) 
                : (project.categories || [])
            }));
            
            setProjects(projectsWithDates);
            console.log("Projects loaded from localStorage:", projectsWithDates);
          } catch (e) {
            console.error("Error parsing localStorage projects:", e);
            setProjects([]);
          }
        } else {
          console.log("No projects found in localStorage");
          setProjects([]);
        }
      } catch (error) {
        console.error("Error loading projects from localStorage:", error);
        setProjects([]);
      }
    };
    
    loadProjects();
  }, [user, importRecoveredProjects]);

  useEffect(() => {
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

    const currentProjectsStr = stringifyProjects(updatedProjects);
    
    if (currentProjectsStr !== lastSavedProjects.current) {
      console.log("Status check triggered an update");
      saveProjects(updatedProjects);
    }
  }, [projects, isLoading]);

  const saveProjects = useCallback(async (newProjects: Project[]) => {
    try {
      const newProjectsStr = stringifyProjects(newProjects);
      
      if (newProjectsStr === lastSavedProjects.current) {
        console.log("No changes detected, skipping save");
        return;
      }
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
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
            const supabaseProject = formatProjectForSupabase(project);
            
            console.log("Formatted project for Supabase:", supabaseProject);
            
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
      }, 300);
    } catch (error) {
      console.error("Error saving projects:", error);
      saveToLocalStorage(newProjects);
    }
  }, [user, toast, saveToLocalStorage]);

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
      
      await sendProjectNotification(newProject as Project, "created");
      
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
      
      const existingProject = projects.find(p => p.id === updatedProject.id);
      const newProjects = projects.map((p) =>
        p.id === updatedProject.id ? {
          ...updatedProject,
          initialDate: updatedProject.initialDate ? new Date(updatedProject.initialDate) : undefined,
          finalDate: updatedProject.finalDate ? new Date(updatedProject.finalDate) : undefined,
          // Ensure categories is always an array
          categories: Array.isArray(updatedProject.categories) 
            ? updatedProject.categories 
            : (typeof updatedProject.categories === 'string' 
              ? JSON.parse(updatedProject.categories) 
              : [])
        } : p
      );
      
      if (existingProject && 
          existingProject.status !== "completed" && 
          updatedProject.status === "completed") {
        await sendProjectNotification(updatedProject, "completed");
      }
      
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

  const calculateProjectCost = useCallback((project: Project) => {
    return calculateCost(project);
  }, []);

  return (
    <ProjectContext.Provider
      value={{ 
        projects, 
        addProject, 
        updateProject, 
        deleteProject, 
        calculateProjectCost, 
        isLoading 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
