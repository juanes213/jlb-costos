
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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

    // Get SMTP credentials from environment variables and log them
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    
    console.log("Available env variables:", Object.keys(Deno.env.toObject()));
    console.log("SMTP Configuration:", {
      host: smtpHost || "not set",
      port: smtpPort || "not set",
      user: smtpUser ? (smtpUser.substring(0, 3) + "***") : "not set",
    });
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Missing SMTP configuration");
    }

    // Try with a simpler approach using standard client options
    const client = new SmtpClient();
    
    try {
      console.log(`Attempting to connect to SMTP server at ${smtpHost}:${smtpPort}...`);
      
      // Try standard TLS connection
      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
        tls: true
      });
      
      console.log("Successfully connected to SMTP server");
      
      // Proceed with sending emails
      const successfulEmails = [];
      const failedEmails = [];
      
      for (const email of RECIPIENT_EMAILS) {
        try {
          console.log(`Sending ${notificationType} notification email to ${email}...`);
          
          const sendResult = await client.send({
            from: smtpUser,
            to: email,
            subject: subject,
            content: htmlContent,
            html: htmlContent
          });
          
          console.log(`Email sent successfully to ${email}, result:`, sendResult);
          successfulEmails.push(email);
        } catch (err) {
          console.error(`Error sending email to ${email}:`, err);
          failedEmails.push({ email, error: String(err) });
        }
      }
      
      // Close the connection when done
      try {
        await client.close();
        console.log("SMTP connection closed successfully");
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
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
    } catch (connectError) {
      console.error("Failed to connect with standard TLS. Error:", connectError);
      
      try {
        // Close any existing connection
        await client.close().catch(() => {});
        
        // Try with explicit non-TLS connection followed by STARTTLS
        console.log("Trying alternative connection method with explicit STARTTLS...");
        
        await client.connect({
          hostname: smtpHost,
          port: smtpPort,
          tls: false
        });
        
        // Then attempt STARTTLS upgrade
        await client.starttls();
        
        // Login after secure connection is established
        await client.login(smtpUser, smtpPass);
        
        console.log("Successfully connected with alternative method");
        
        // Send emails with similar logic as above
        const successfulEmails = [];
        const failedEmails = [];
        
        for (const email of RECIPIENT_EMAILS) {
          try {
            console.log(`Sending ${notificationType} notification email to ${email} (alternative method)...`);
            
            const sendResult = await client.send({
              from: smtpUser,
              to: email,
              subject: subject,
              content: htmlContent,
              html: htmlContent
            });
            
            console.log(`Email sent successfully to ${email}, result:`, sendResult);
            successfulEmails.push(email);
          } catch (err) {
            console.error(`Error sending email to ${email}:`, err);
            failedEmails.push({ email, error: String(err) });
          }
        }
        
        // Close the connection
        await client.close();
        
        // Return response
        const allEmailsSuccessful = failedEmails.length === 0;
        
        return new Response(
          JSON.stringify({
            success: successfulEmails.length > 0,
            message: `${notificationType === "created" ? "Project creation" : "Project completion"} emails sent to ${successfulEmails.length}/${RECIPIENT_EMAILS.length} recipients (alternative method)`,
            successfulEmails,
            failedEmails
          }),
          {
            status: allEmailsSuccessful ? 200 : 207,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (fallbackError) {
        console.error("Both connection methods failed. Error with alternative method:", fallbackError);
        throw new Error(`SMTP connection failed with both methods. Original error: ${connectError.message}, Alternative method error: ${fallbackError.message}`);
      }
    }
  } catch (error) {
    console.error("Error in project notification handler:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Email sending failed", 
        details: String(error),
        suggestion: "Please check your SMTP server configuration and network connectivity."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
