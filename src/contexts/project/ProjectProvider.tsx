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

export function ProjectProvider({ children }: ProjectContextProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const pendingSaves = useRef<Set<string>>(new Set());
  const lastSavedProjects = useRef<string>("");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckEnabledRef = useRef<boolean>(false);
  
  const sendProjectNotification = useProjectNotifications();
  const { saveToLocalStorage } = useProjectPersistence(toast);

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
  }, [user]);

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
