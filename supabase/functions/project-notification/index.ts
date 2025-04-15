
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@0.12.0/mod.ts";

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
      // Get SMTP configuration from environment variables
      const smtpUser = Deno.env.get("SMTP_USER");
      const smtpPass = Deno.env.get("SMTP_PASS");
      const smtpHost = Deno.env.get("SMTP_HOST");
      const smtpPort = Number(Deno.env.get("SMTP_PORT") || 587);
      const smtpTLS = Deno.env.get("SMTP_TLS") === "true";

      // Log SMTP configuration details for debugging
      console.log("SMTP Configuration:", {
        host: smtpHost,
        port: smtpPort,
        tls: smtpTLS,
        user: smtpUser ? "***" : "Not set",
      });

      // Validate SMTP configuration
      if (!smtpUser || !smtpPass || !smtpHost) {
        throw new Error("Missing SMTP configuration");
      }

      // Create SMTP client
      const client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: smtpTLS,
          auth: {
            username: smtpUser,
            password: smtpPass,
          },
        },
      });

      // Send emails to all recipients
      console.log(`Sending ${notificationType} notification emails to:`, RECIPIENT_EMAILS);
      
      // Send to each recipient individually
      for (const recipientEmail of RECIPIENT_EMAILS) {
        try {
          await client.send({
            from: smtpUser,
            to: recipientEmail,
            subject: subject,
            content: htmlContent,
            html: htmlContent,
          });
          console.log(`Email sent successfully to ${recipientEmail}`);
        } catch (recipientError) {
          console.error(`Error sending email to ${recipientEmail}:`, recipientError);
        }
      }

      // Close the connection
      await client.close();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Emails sent successfully to ${RECIPIENT_EMAILS.length} recipients` 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed", 
          details: emailError.message || "Unknown error",
          solution: "Please check your SMTP configuration in Supabase secrets."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
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
