
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

    // Get EmailJS credentials from environment
    const emailjsServiceId = Deno.env.get("EMAILJS_SERVICE_ID");
    const emailjsTemplateId = Deno.env.get("EMAILJS_TEMPLATE_ID");
    const emailjsPublicKey = Deno.env.get("EMAILJS_PUBLIC_KEY");
    const emailjsApiKey = Deno.env.get("EMAILJS_API_KEY");
    
    console.log("Available env variables:", Object.keys(Deno.env.toObject()));
    console.log("EmailJS Configuration:", {
      serviceId: emailjsServiceId ? "configured" : "not set",
      templateId: emailjsTemplateId ? "configured" : "not set",
      publicKey: emailjsPublicKey ? "configured" : "not set",
      apiKey: emailjsApiKey ? "configured" : "not set"
    });
    
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsApiKey) {
      throw new Error("Missing EmailJS configuration");
    }

    const successfulEmails = [];
    const failedEmails = [];
    
    // Send an email to each recipient using EmailJS
    for (const email of RECIPIENT_EMAILS) {
      try {
        console.log(`Sending ${notificationType} notification email to ${email} via EmailJS...`);
        
        const emailjsEndpoint = "https://api.emailjs.com/api/v1.0/email/send";
        const emailjsPayload = {
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          accessToken: emailjsApiKey,
          template_params: {
            to_email: email,
            subject: subject,
            message_html: htmlContent,
            project_name: projectName,
            project_id: projectId,
            project_link: projectLink,
            created_by: createdByText || "el sistema"
          }
        };
        
        const emailResponse = await fetch(emailjsEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailjsPayload),
        });
        
        if (emailResponse.status === 200) {
          console.log(`Email successfully sent to ${email}`);
          successfulEmails.push(email);
        } else {
          const errorText = await emailResponse.text();
          console.error(`Failed to send email to ${email}. Status: ${emailResponse.status}, Response:`, errorText);
          failedEmails.push({ email, error: `Status ${emailResponse.status}: ${errorText}` });
        }
      } catch (err) {
        console.error(`Error sending email to ${email}:`, err);
        failedEmails.push({ email, error: String(err) });
      }
    }
    
    // Return response with results
    const allEmailsSuccessful = failedEmails.length === 0;
    
    return new Response(
      JSON.stringify({
        success: successfulEmails.length > 0,
        message: `${notificationType === "created" ? "Project creation" : "Project completion"} emails sent to ${successfulEmails.length}/${RECIPIENT_EMAILS.length} recipients`,
        successfulEmails,
        failedEmails
      }),
      {
        status: allEmailsSuccessful ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in project notification handler:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Email sending failed", 
        details: String(error),
        suggestion: "Please check the EmailJS configuration and network connectivity."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
