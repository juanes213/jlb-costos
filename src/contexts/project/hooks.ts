
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

      // Use fetch directly for more control over the request
      try {
        // Show a notification that we're sending emails
        toast({
          title: "Notificación por correo",
          description: "Enviando notificaciones por correo...",
          duration: 3000,
        });
        
        const response = await fetch('https://xkiqeoxngnrmqfbdagcv.supabase.co/functions/v1/project-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
            'apikey': supabase.supabaseKey
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        console.log(`Project ${notificationType} notification emails sent successfully:`, data);
        
        toast({
          title: "Correos enviados",
          description: "Las notificaciones por correo se han enviado correctamente.",
          duration: 3000,
        });
      } catch (fetchError) {
        console.error("Error sending email notification via fetch:", fetchError);
        toast({
          title: "Error",
          description: "No se pudieron enviar las notificaciones por correo electrónico.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error in sendProjectNotification:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      // Show error to user
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar las notificaciones.",
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
