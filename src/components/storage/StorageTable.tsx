
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil, Info, Download, Upload, FileText } from "lucide-react";
import { IvaButton } from "../shared/IvaButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StorageItem } from "@/types/project";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatFileSize } from "@/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StorageTableProps {
  items: StorageItem[];
  onDeleteItem: (id: string) => void;
  onEditItem: (item: StorageItem) => void;
}

export function StorageTable({ items, onDeleteItem, onEditItem }: StorageTableProps) {
  const [ivaAmounts, setIvaAmounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleIvaCalculated = (itemId: string, ivaAmount: number | undefined) => {
    setIvaAmounts(prev => ({
      ...prev,
      [itemId]: ivaAmount || 0
    }));
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuotesClick = (item: StorageItem) => {
    setSelectedItem(item);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedItem) return;
    
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
      const filePath = `items/${selectedItem.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
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
      
      // Update the item with new quote
      const { error: updateError } = await supabase
        .from("storage_items")
        .update({ 
          quotes: selectedItem.quotes ? [...selectedItem.quotes, newQuote] : [newQuote] 
        })
        .eq("id", selectedItem.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setSelectedItem({
        ...selectedItem,
        quotes: selectedItem.quotes ? [...selectedItem.quotes, newQuote] : [newQuote]
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
  
  const handleDownload = async (quote: any) => {
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
  
  const handleDelete = async (quote: any) => {
    if (!selectedItem) return;
    
    try {
      const { error } = await supabase.storage
        .from("project_quotes")
        .remove([quote.path]);
      
      if (error) throw error;
      
      // Update the item without deleted quote
      const updatedQuotes = selectedItem.quotes?.filter((q: any) => q.id !== quote.id) || [];
      
      const { error: updateError } = await supabase
        .from("storage_items")
        .update({ quotes: updatedQuotes })
        .eq("id", selectedItem.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setSelectedItem({
        ...selectedItem,
        quotes: updatedQuotes
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
    <>
      <Card className="p-6 bg-white shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Items en Almacén</h2>
          <div className="w-64">
            <Input
              placeholder="Buscar item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>IVA</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No se encontraron items
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {item.name}
                    {item.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-blue-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>{item.unit || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.cost)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IvaButton
                        cost={item.cost}
                        onIvaCalculated={(amount) => handleIvaCalculated(item.id, amount)}
                        ivaAmount={ivaAmounts[item.id]}
                      />
                      {ivaAmounts[item.id] > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(ivaAmounts[item.id])}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuotesClick(item)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditItem(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cotizaciones para {selectedItem?.name}</DialogTitle>
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
            
            {!selectedItem?.quotes || selectedItem.quotes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No hay cotizaciones asociadas a este item
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItem.quotes.map((quote: any) => (
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
    </>
  );
}
