
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Using a reliable and maintained SMTP client
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/smtp.ts";

// Define proper CORS headers - make them as permissive as possible for testing
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Max-Age": "86400",
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

// This is the main handler
serve(async (req) => {
  console.log("Edge function received request:", req.method);
  
  // Handle CORS preflight requests FIRST, before anything else
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  // For non-OPTIONS requests, proceed with normal handling
  try {
    console.log("Request URL:", req.url);
    console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));

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
        JSON.stringify({ error: "Invalid JSON in request body", details: String(parseError) }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { projectName, projectId, notificationType, createdBy } = parsedBody as ProjectNotificationRequest;

    console.log("Parsed request data:", { projectName, projectId, notificationType, createdBy });

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

      console.log("SMTP Configuration:", {
        host: smtpHost,
        port: smtpPort,
        tls: smtpTLS,
        user: smtpUser ? "***" : "Not set",
      });

      // Validate SMTP configuration
      if (!smtpUser || !smtpPass || !smtpHost) {
        console.error("Missing SMTP configuration");
        throw new Error("Missing SMTP configuration");
      }

      // Create SMTP client with the correct format for this version
      const client = new SmtpClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: smtpTLS,
        },
        auth: {
          username: smtpUser,
          password: smtpPass,
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
            content: "text/html",
            html: htmlContent,
          });
          console.log(`Email sent successfully to ${recipientEmail}`);
        } catch (recipientError) {
          console.error(`Error sending email to ${recipientEmail}:`, recipientError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Emails sent successfully to ${RECIPIENT_EMAILS.length} recipients` 
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
