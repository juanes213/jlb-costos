
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Fixed recipient email addresses
const NOTIFICATION_RECIPIENTS = [
  "gerenteadm@jorgebedoya.com",
  "cfinanciero@jorgebedoya.com",
  "gerenciacomercial@jorgebedoya.com",
  "juanes.200.200@gmail.com"
];

interface ProjectNotificationRequest {
  projectName: string;
  projectId: string;
  notificationType: "created" | "completed";
  createdBy?: string;
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

    const { 
      projectName, 
      projectId, 
      notificationType, 
      createdBy
    } = parsedBody as ProjectNotificationRequest;

    // Log the client emails for notification
    console.log(`Sending notification to fixed recipients: ${NOTIFICATION_RECIPIENTS.join(', ')}`);

    try {
      const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
      
      if (!BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY not found in environment variables");
      }
      
      const emailSubject = notificationType === "created" 
        ? `Nuevo proyecto creado: ${projectName}`
        : `Proyecto completado: ${projectName}`;
        
      const emailContent = notificationType === "created"
        ? `Se ha creado un nuevo proyecto: ${projectName} (ID: ${projectId})`
        : `El proyecto ${projectName} (ID: ${projectId}) ha sido marcado como completado.`;
      
      const emailPromises = NOTIFICATION_RECIPIENTS.map(recipientEmail => 
        fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              name: "JLB Proyectos Notificaciones",
              email: "notificaciones@empresa.com"
            },
            to: [
              {
                email: recipientEmail,
                name: "Receptor"
              }
            ],
            subject: emailSubject,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 5px;">
                <h1 style="color: #333;">${emailSubject}</h1>
                <p style="font-size: 16px; color: #666; line-height: 24px;">${emailContent}</p>
                <p style="font-size: 14px; color: #888; margin-top: 30px;">Este es un mensaje automático. Por favor no responda a este correo.</p>
              </div>
            `,
            textContent: emailContent
          })
        }).then(response => response.json())
      );

      const emailResponses = await Promise.all(emailPromises);
      
      const emailStatuses = emailResponses.map((response, index) => ({
        email: NOTIFICATION_RECIPIENTS[index],
        success: response.messageId ? true : false,
        details: response
      }));
      
      console.log(`Email notifications sent:`, emailStatuses);
      
      // Update the return response to include email statuses
      return new Response(
        JSON.stringify({
          success: true,
          message: `Project ${notificationType} notification processed successfully`,
          emails: emailStatuses
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Project ${notificationType} notification processed`,
          emails: { 
            success: false, 
            message: `Failed to send emails: ${emailError.message}` 
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
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
