
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
      duration: 5000,
    });
    
    // Send email notifications via edge function
    try {
      toast({
        title: "Notificación por correo",
        description: "Enviando notificaciones por correo...",
        duration: 3000,
      });
      
      const currentUser = await supabase.auth.getUser();
      const userEmail = currentUser?.data?.user?.email;
      
      const payload = {
        projectName: project.name,
        projectId: project.numberId || project.id,
        notificationType,
        createdBy: userEmail
      };
      
      console.log(`Sending ${notificationType} notification for project:`, project.name);
      console.log("Request payload:", payload);

      // Use the Supabase client functions API instead of direct fetch
      const { data, error } = await supabase.functions.invoke('project-notification', {
        body: payload
      });
      
      if (error) {
        throw new Error(`Error: ${error.message || 'Unknown error'}`);
      }
      
      console.log(`Project ${notificationType} notification emails sent:`, data);
      
      if (data.success) {
        toast({
          title: "Correos enviados",
          description: `Notificaciones enviadas a ${data.successfulEmails?.length || 0} destinatarios.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Advertencia",
          description: `No se pudieron enviar todas las notificaciones. ${data.successfulEmails?.length || 0} de ${data.successfulEmails?.length + data.failedEmails?.length || 0} enviados.`,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones por correo electrónico. Compruebe los registros para más detalles.",
        variant: "destructive",
        duration: 5000,
      });
    }
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
