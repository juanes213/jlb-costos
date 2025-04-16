
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProjectNotificationRequest {
  projectName: string;
  projectId: string;
  notificationType: "created" | "completed";
  createdBy?: string;
  clientEmail?: string; // Add client email to the request
}

// Main handler function
serve(async (req) => {
  console.log("Edge function received request:", req.method);
  
  // Handle CORS preflight requests
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

    const { projectName, projectId, notificationType, createdBy, clientEmail } = parsedBody as ProjectNotificationRequest;

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
    
    // Log project notification info
    console.log("Project notification received:");
    console.log(`Project: ${projectName} (ID: ${projectId})`);
    console.log(`Type: ${notificationType}`);
    console.log(`Created By: ${createdBy || "unknown user"}`);
    console.log(`Client Email: ${clientEmail || "no client email provided"}`);
    
    // Try to send email using SendGrid if client email is provided
    let emailResult = { success: false, message: "No client email provided" };
    
    if (clientEmail) {
      try {
        // Prepare email content
        const subject = notificationType === "created" 
          ? `Nuevo proyecto creado: ${projectName}`
          : `Proyecto completado: ${projectName}`;
          
        const content = notificationType === "created"
          ? `Se ha creado un nuevo proyecto: ${projectName} (ID: ${projectId})`
          : `El proyecto ${projectName} (ID: ${projectId}) ha sido marcado como completado.`;
          
        // Use SendGrid API to send the email
        const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
        
        if (!SENDGRID_API_KEY) {
          throw new Error("SENDGRID_API_KEY not found in environment variables");
        }
        
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: clientEmail }]
            }],
            from: { 
              email: "notificaciones@jlbproyectos.com", // Update this with your verified sender
              name: "JLB Proyectos Notificaciones"
            },
            subject: subject,
            content: [{
              type: "text/plain",
              value: content
            }, {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 5px;">
                  <h1 style="color: #333;">${subject}</h1>
                  <p style="font-size: 16px; color: #666; line-height: 24px;">${content}</p>
                  <p style="font-size: 14px; color: #888; margin-top: 30px;">Este es un mensaje automático. Por favor no responda a este correo.</p>
                </div>
              `
            }]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
        }
        
        emailResult = { 
          success: true, 
          message: `Email sent successfully to ${clientEmail}` 
        };
        console.log(`Email notification sent successfully to ${clientEmail}`);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        emailResult = { 
          success: false, 
          message: `Failed to send email: ${emailError.message}` 
        };
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Project ${notificationType} notification processed successfully`,
        project: {
          name: projectName,
          id: projectId,
        },
        notification_type: notificationType,
        email: emailResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in project notification handler:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
