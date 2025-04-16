
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types/project";

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
    
    // Log notification to Supabase edge function (with email sending)
    try {
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

      // Use the Supabase client functions API
      const { data, error } = await supabase.functions.invoke('project-notification', {
        body: payload
      });
      
      if (error) {
        console.error("Error logging project notification:", error);
        toast({
          title: "Error de notificación",
          description: "No se pudo enviar la notificación de proyecto.",
          variant: "destructive",
        });
      } else {
        console.log(`Project ${notificationType} notification processed:`, data);
        
        // Show email status in toast if relevant
        if (data?.emails) {
          const successfulEmails = Array.isArray(data.emails) 
            ? data.emails.filter((email: any) => email.success)
            : [];
            
          const failedEmails = Array.isArray(data.emails)
            ? data.emails.filter((email: any) => !email.success)
            : [];
          
          if (successfulEmails.length > 0) {
            toast({
              title: "Notificación enviada",
              description: `Se ha enviado un correo a ${successfulEmails.length} destinatario(s).`,
            });
          }
          
          if (failedEmails.length > 0) {
            toast({
              title: "Error de correo",
              description: `No se pudo enviar correo a ${failedEmails.length} destinatario(s).`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending notification to edge function:", error);
      toast({
        title: "Error",
        description: "Error al procesar la notificación del proyecto.",
        variant: "destructive",
      });
    }
  }, [toast]);
}
