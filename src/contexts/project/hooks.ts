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
      
      const payload = {
        projectName: project.name,
        projectId: project.numberId || project.id,
        notificationType,
        createdBy: supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.email : undefined
      };
      
      console.log(`Sending ${notificationType} notification for project:`, project.name);
      console.log("Request payload:", payload);

      const supabaseUrl = 'https://xkiqeoxngnrmqfbdagcv.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraXFlb3huZ25ybXFmYmRhZ2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODgxNTIsImV4cCI6MjA1NzM2NDE1Mn0.vOaOGnNsrMFWPmjixDA_8G5zP_S50Lcy4U7XXLK7L4M';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/project-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(data)}`);
      }
      
      console.log(`Project ${notificationType} notification emails sent:`, data);
      
      toast({
        title: "Correos enviados",
        description: `Notificaciones enviadas a ${data.successfulEmails?.length || 0} destinatarios.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones por correo electrónico.",
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
