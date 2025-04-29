import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Project, QuoteFile } from "@/types/project";
import { FileText, Download, Eye, Trash, Upload } from "lucide-react";
import { format } from "date-fns";
import { formatFileSize } from "@/utils/formatters";

interface ProjectQuotesProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
}

export function ProjectQuotes({ project, onUpdateProject }: ProjectQuotesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const quotes = project.quotes || [];
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        });
        return;
      }
      
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${project.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from("project_quotes")
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      const newQuote: QuoteFile = {
        id: crypto.randomUUID(),
        name: file.name,
        path: filePath,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      
      const updatedQuotes = [...quotes, newQuote];
      onUpdateProject({
        ...project,
        quotes: updatedQuotes,
      });
      
      toast({
        title: "Éxito",
        description: "Cotización subida correctamente",
      });
      
    } catch (error) {
      console.error("Error uploading quote:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la cotización",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };
  
  const handlePreview = async (quote: QuoteFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("project_quotes")
        .createSignedUrl(quote.path, 60);
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error previewing quote:", error);
      toast({
        title: "Error",
        description: "No se pudo previsualizar la cotización",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = async (quote: QuoteFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("project_quotes")
        .createSignedUrl(quote.path, 60);
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = quote.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading quote:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar la cotización",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (quote: QuoteFile) => {
    try {
      const { error } = await supabase.storage
        .from("project_quotes")
        .remove([quote.path]);
      
      if (error) throw error;
      
      const updatedQuotes = quotes.filter(q => q.id !== quote.id);
      onUpdateProject({
        ...project,
        quotes: updatedQuotes,
      });
      
      toast({
        title: "Éxito",
        description: "Cotización eliminada correctamente",
      });
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cotización",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Cotizaciones</CardTitle>
        <CardDescription>
          Gestiona las cotizaciones asociadas al proyecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" disabled={isUploading}>
            <label className="cursor-pointer flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Subiendo..." : "Subir cotización"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
        </div>
        
        {quotes.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No hay cotizaciones asociadas a este proyecto
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div 
                key={quote.id} 
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-500" />
                  <div>
                    <p className="font-medium">{quote.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(quote.size)} • Subido el {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handlePreview(quote)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownload(quote)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(quote)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
