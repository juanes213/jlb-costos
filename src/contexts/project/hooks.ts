
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

// Hook for project notifications
export function useProjectNotifications(userId: string | undefined) {
  return useCallback(async (
    project: Project, 
    notificationType: "created" | "completed"
  ) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase.functions.invoke('project-notification', {
        body: {
          projectName: project.name,
          projectId: project.numberId || project.id,
          notificationType,
          createdBy: userId
        }
      });
      
      if (error) {
        console.error("Error sending project notification:", error);
      } else {
        console.log(`Project ${notificationType} notification sent successfully`);
      }
    } catch (error) {
      console.error("Error in sendProjectNotification:", error);
    }
  }, [userId]);
}

// Hook for project persistence operations
export function useProjectPersistence(toast: ReturnType<typeof useToast>["toast"]) {
  const saveToLocalStorage = useCallback((projects: Project[]) => {
    try {
      const projectsStr = JSON.stringify(projects, (key, value) => {
        if (key === 'initialDate' || key === 'finalDate') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      
      localStorage.setItem("jlb_projects_v1", projectsStr);
      console.log("Projects saved to localStorage with key: jlb_projects_v1");
    } catch (error) {
      console.error("Error saving projects to localStorage:", error);
    }
  }, []);

  return { saveToLocalStorage };
}
