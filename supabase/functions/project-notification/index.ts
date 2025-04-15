
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Define recipient emails
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

// Main handler function
serve(async (req) => {
  console.log("Edge function received request:", req.method);
  
  // Handle CORS preflight requests - This is crucial!
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    console.log("Request URL:", req.url);
    
    if (req.method !== "POST") {
      console.log(`Rejecting ${req.method} request - only POST is allowed`);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
      console.log("Request body parsed successfully:", parsedBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { projectName, projectId, notificationType, createdBy } = parsedBody as ProjectNotificationRequest;

    if (!projectName || !notificationType) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare email content
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
      // We'll use a simple approach to send emails to all recipients
      const successfulEmails = [];
      const failedEmails = [];
      
      // Check if we have SMTP configuration
      const smtpHost = Deno.env.get("SMTP_HOST");
      const smtpUser = Deno.env.get("SMTP_USER");
      
      if (!smtpHost || !smtpUser) {
        throw new Error("Missing SMTP configuration");
      }

      // For demo/testing purposes, just log the emails we would send
      console.log("Would send emails to:", RECIPIENT_EMAILS);
      console.log("Subject:", subject);
      console.log("HTML Content:", htmlContent);
      
      // Simulate successful email sending for all recipients
      for (const email of RECIPIENT_EMAILS) {
        console.log(`Simulating sending email to: ${email}`);
        successfulEmails.push(email);
      }

      // Return a successful response (for testing purposes)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Emails would be sent to ${successfulEmails.length} recipients`,
          successfulEmails,
          failedEmails
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed", 
          details: String(emailError),
          solution: "Please check your SMTP configuration in Supabase secrets."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing project notification request:", error);
    
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
