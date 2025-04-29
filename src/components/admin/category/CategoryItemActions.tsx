
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, FileText, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatFileSize } from "@/utils/formatters";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { QuoteFile } from "@/types/project";

interface CategoryItemActionsProps {
  onDelete: () => void;
  itemId: string;
  quotes?: QuoteFile[];
  onQuotesChange?: (quotes: QuoteFile[]) => void;
}

export function CategoryItemActions({ onDelete, itemId, quotes = [], onQuotesChange }: CategoryItemActionsProps) {
  const [showQuotesDialog, setShowQuotesDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
      const filePath = `items/${itemId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from("project_quotes")
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      const newQuote = {
        id: crypto.randomUUID(),
        name: file.name,
        path: filePath,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      
      const updatedQuotes = [...quotes, newQuote];
      
      if (onQuotesChange) {
        onQuotesChange(updatedQuotes);
      }
      
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
      if (e.target) {
        e.target.value = "";
      }
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
      
      if (onQuotesChange) {
        onQuotesChange(updatedQuotes);
      }
      
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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowQuotesDialog(true)}
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        <Trash className="w-4 h-4" />
      </Button>

      <Dialog open={showQuotesDialog} onOpenChange={setShowQuotesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cotizaciones</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
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
                No hay cotizaciones asociadas a este item
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
                          {quote.size && formatFileSize(quote.size)} • Subido el {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
