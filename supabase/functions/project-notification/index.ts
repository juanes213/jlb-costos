
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// The only authorized recipient for testing purposes
const AUTHORIZED_RECIPIENT = "albisj@uninorte.edu.co";

interface ProjectNotificationRequest {
  projectName: string;
  projectId: string;
  notificationType: "created" | "completed";
  createdBy?: string;
  income?: number;
  initialDate?: string;
  finalDate?: string;
}

// Format currency in COP
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date in Spanish format
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "No definida";
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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
      createdBy,
      income,
      initialDate,
      finalDate
    } = parsedBody as ProjectNotificationRequest;

    // Log the recipient for notification
    console.log(`Sending notification to: ${AUTHORIZED_RECIPIENT}`);

    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      
      if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not found in environment variables");
      }
      
      const resend = new Resend(RESEND_API_KEY);
      
      const emailSubject = notificationType === "created" 
        ? `Nuevo proyecto creado: ${projectName}`
        : `Proyecto completado: ${projectName}`;
        
      const emailContent = notificationType === "created"
        ? `Se ha creado un nuevo proyecto: ${projectName} (ID: ${projectId})`
        : `El proyecto ${projectName} (ID: ${projectId}) ha sido marcado como completado.`;
      
      const incomeFormatted = income ? formatCurrency(income) : "No definido";
      const createdByInfo = createdBy ? `<strong>${createdBy}</strong>` : "Usuario del sistema";
      
      const emailResponse = await resend.emails.send({
        from: "JLB Proyectos <onboarding@resend.dev>",
        to: AUTHORIZED_RECIPIENT,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 5px; background-color: #f9f9f9;">
            <div style="background-color: #0057b8; color: white; padding: 15px; border-radius: 5px 5px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">${emailSubject}</h1>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea;">
              <p style="font-size: 16px; color: #333; line-height: 24px;">${emailContent}</p>
              
              <div style="background-color: #f5f5f5; border-left: 4px solid #0057b8; padding: 15px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #0057b8; font-size: 18px;">Detalles del Proyecto</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd; width: 40%;"><strong>Nombre:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${projectId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Creado por:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${createdByInfo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Ingreso Estimado:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${incomeFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Fecha Inicial:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${formatDate(initialDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Fecha Final:</strong></td>
                    <td style="padding: 8px 0;">${formatDate(finalDate)}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
                Este es un mensaje automático del sistema JLB Proyectos.<br>Por favor no responda a este correo.
              </p>
            </div>
            
            <div style="text-align: center; padding-top: 15px; font-size: 12px; color: #666;">
              © ${new Date().getFullYear()} JLB Construcciones
            </div>
          </div>
        `,
        text: `
${emailSubject}

${emailContent}

DETALLES DEL PROYECTO:
Nombre: ${projectName}
ID: ${projectId}
Creado por: ${createdBy || "Usuario del sistema"}
Ingreso Estimado: ${incomeFormatted}
Fecha Inicial: ${formatDate(initialDate)}
Fecha Final: ${formatDate(finalDate)}

Este es un mensaje automático del sistema JLB Proyectos.
Por favor no responda a este correo.
        `
      });
      
      console.log(`Email notification response:`, emailResponse);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Project ${notificationType} notification processed successfully`,
          email: {
            recipient: AUTHORIZED_RECIPIENT,
            success: !!emailResponse.id,
            details: emailResponse
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Project ${notificationType} notification processing failed`,
          error: { 
            message: emailError.message,
            details: String(emailError)
          }
        }),
        {
          status: 500,
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
