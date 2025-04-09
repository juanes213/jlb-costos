
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define recipient emails as a constant array
const RECIPIENT_EMAILS = [
  "gerenteadm@jorgebedoya.com",
  "cfinanciero@jorgebedoya.com",
  "gerenciacomercial@jorgebedoya.com"
];

// Define application URL for links
const APPLICATION_URL = "https://jlb-costos.lovable.app";

interface ProjectNotificationRequest {
  projectName: string;
  projectId: string;
  notificationType: "created" | "completed";
  createdBy?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, projectId, notificationType, createdBy }: ProjectNotificationRequest = await req.json();

    if (!projectName || !notificationType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let subject = "";
    let htmlContent = "";
    const createdByText = createdBy ? `por ${createdBy}` : "";
    const projectLink = `${APPLICATION_URL}/admin/projects/${projectId}`;

    if (notificationType === "created") {
      subject = `Nuevo proyecto creado: ${projectName}`;
      htmlContent = `
        <h1>Nuevo proyecto creado</h1>
        <p>El proyecto <strong>${projectName}</strong> (ID: ${projectId}) ha sido creado exitosamente ${createdByText}.</p>
        <p>Puede acceder al proyecto en el <a href="${projectLink}">dashboard de administración</a>.</p>
        <p><a href="${APPLICATION_URL}">Ir al sistema</a></p>
      `;
    } else if (notificationType === "completed") {
      subject = `Proyecto completado: ${projectName}`;
      htmlContent = `
        <h1>Proyecto completado</h1>
        <p>El proyecto <strong>${projectName}</strong> (ID: ${projectId}) ha sido marcado como completado ${createdByText}.</p>
        <p>Puede acceder al proyecto en el <a href="${projectLink}">dashboard de administración</a>.</p>
        <p><a href="${APPLICATION_URL}">Ir al sistema</a></p>
      `;
    }

    try {
      // Try to send the email
      const emailResponse = await resend.emails.send({
        from: "Notificaciones <onboarding@resend.dev>",
        to: RECIPIENT_EMAILS,
        subject: subject,
        html: htmlContent,
      });

      console.log("Email notification sent successfully to:", RECIPIENT_EMAILS);
      console.log("Email response:", emailResponse);

      return new Response(JSON.stringify({ success: true, data: emailResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (emailError: any) {
      console.error("Error sending email via Resend:", emailError);
      
      // Check if this is a domain verification error
      if (emailError.statusCode === 403 && emailError.message?.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            error: "Domain verification required", 
            message: "You need to verify your domain at resend.com/domains before sending emails to multiple recipients.",
            details: emailError.message,
            solution: "Please visit https://resend.com/domains to verify your domain."
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Email sending failed", details: emailError.message || "Unknown error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error("Error processing project notification request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
