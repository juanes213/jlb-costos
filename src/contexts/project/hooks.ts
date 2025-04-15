
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";

// Hook for project notifications
export function useProjectNotifications() {
  const { toast } = useToast();
  
  return useCallback(async (
    project: Project, 
    notificationType: "created" | "completed"
  ) => {
    // Show in-app toast notification
    const title = notificationType === "created" 
      ? "Proyecto creado" 
      : "Proyecto completado";
    
    const description = notificationType === "created"
      ? `El proyecto "${project.name}" (ID: ${project.numberId || project.id}) ha sido creado exitosamente.`
      : `El proyecto "${project.name}" (ID: ${project.numberId || project.id}) ha sido marcado como completado.`;
    
    toast({
      title,
      description,
      duration: 5000, // Show for 5 seconds
    });
    
    // Send email notifications via edge function
    try {
      const payload = {
        projectName: project.name,
        projectId: project.numberId || project.id,
        notificationType
      };
      
      console.log(`Sending ${notificationType} notification for project:`, project.name);
      console.log("Request payload:", payload);
      
      // Call the edge function with proper error handling
      const { data, error } = await supabase.functions.invoke('project-notification', {
        body: payload,
        // Explicitly set headers to ensure proper CORS handling
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (error) {
        console.error("Error sending project notification:", error);
        console.error("Error details:", JSON.stringify(error));
        toast({
          title: "Error de notificación",
          description: "No se pudieron enviar las notificaciones por correo.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        console.log(`Project ${notificationType} notification emails sent successfully:`, data);
      }
    } catch (error) {
      console.error("Error in sendProjectNotification:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      toast({
        title: "Error de notificación",
        description: "Ocurrió un error al enviar las notificaciones por correo.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    console.log(`Project ${notificationType} notification displayed: ${project.name}`);
  }, [toast]);
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
