
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Header } from "@/components/shared/Header";

type VisitStatus = "pending" | "completed" | "converted" | "cancelled";

interface CustomerVisit {
  id: string;
  customerName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceValue: number;
  bidValue: number;
  status: VisitStatus;
  remarks: string;
}

export default function CustomerVisits() {
  const [visits, setVisits] = useState<CustomerVisit[]>(() => {
    const savedVisits = localStorage.getItem("customerVisits");
    return savedVisits ? JSON.parse(savedVisits) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<CustomerVisit | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const visitData: CustomerVisit = {
      id: editingVisit?.id || crypto.randomUUID(),
      customerName: formData.get("customerName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      serviceType: formData.get("serviceType") as string,
      date: formData.get("date") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      serviceValue: Number(formData.get("serviceValue")),
      bidValue: Number(formData.get("bidValue")),
      status: formData.get("status") as VisitStatus,
      remarks: formData.get("remarks") as string,
    };

    if (editingVisit) {
      setVisits(visits.map(visit => visit.id === editingVisit.id ? visitData : visit));
      toast({
        title: "Éxito",
        description: "Visita actualizada correctamente",
      });
    } else {
      setVisits([...visits, visitData]);
      toast({
        title: "Éxito",
        description: "Visita registrada correctamente",
      });
    }
    
    localStorage.setItem("customerVisits", JSON.stringify(editingVisit 
      ? visits.map(visit => visit.id === editingVisit.id ? visitData : visit)
      : [...visits, visitData]
    ));
    
    setIsFormOpen(false);
    setEditingVisit(null);
    e.currentTarget.reset();
  };

  const handleEdit = (visit: CustomerVisit) => {
    setEditingVisit(visit);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedVisits = visits.filter(visit => visit.id !== id);
    setVisits(updatedVisits);
    localStorage.setItem("customerVisits", JSON.stringify(updatedVisits));
    toast({
      title: "Éxito",
      description: "Visita eliminada correctamente",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Control de Visitas</h1>
          <Button onClick={() => {
            setIsFormOpen(!isFormOpen);
            setEditingVisit(null);
          }}>
            {isFormOpen ? "Cancelar" : "Nueva Visita"}
          </Button>
        </div>

        {isFormOpen && (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  name="customerName" 
                  placeholder="Nombre del Cliente" 
                  required 
                  defaultValue={editingVisit?.customerName}
                />
                <Input 
                  name="contactName" 
                  placeholder="Nombre de Contacto" 
                  required 
                  defaultValue={editingVisit?.contactName}
                />
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="Email" 
                  required 
                  defaultValue={editingVisit?.email}
                />
                <Input 
                  name="phone" 
                  placeholder="Teléfono" 
                  required 
                  defaultValue={editingVisit?.phone}
                />
                <Input 
                  name="serviceType" 
                  placeholder="Tipo de Servicio" 
                  required 
                  defaultValue={editingVisit?.serviceType}
                />
                <Input 
                  name="date" 
                  type="date" 
                  required 
                  defaultValue={editingVisit?.date}
                />
                <Input 
                  name="startTime" 
                  type="time" 
                  required 
                  defaultValue={editingVisit?.startTime}
                />
                <Input 
                  name="endTime" 
                  type="time" 
                  required 
                  defaultValue={editingVisit?.endTime}
                />
                <Input
                  name="serviceValue"
                  type="number"
                  placeholder="Valor del Servicio"
                  required
                  defaultValue={editingVisit?.serviceValue}
                />
                <Input
                  name="bidValue"
                  type="number"
                  placeholder="Valor de la Oferta"
                  required
                  defaultValue={editingVisit?.bidValue}
                />
                <Select name="status" required defaultValue={editingVisit?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="converted">Convertida a OS</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea 
                name="remarks" 
                placeholder="Observaciones" 
                defaultValue={editingVisit?.remarks}
              />
              <Button type="submit">
                {editingVisit ? "Actualizar Visita" : "Guardar Visita"}
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {visits.map((visit) => (
            <Card key={visit.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">{visit.customerName}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(visit.date), "dd/MM/yyyy")} - {visit.startTime} a {visit.endTime}
                  </p>
                </div>
                <div className="flex justify-end items-start gap-2">
                  <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                    {visit.status === "pending" && "Pendiente"}
                    {visit.status === "completed" && "Completada"}
                    {visit.status === "converted" && "Convertida a OS"}
                    {visit.status === "cancelled" && "Cancelada"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(visit)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(visit.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm">
                    <strong>Contacto:</strong> {visit.contactName} - {visit.phone}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {visit.email}
                  </p>
                  <p className="text-sm">
                    <strong>Tipo de Servicio:</strong> {visit.serviceType}
                  </p>
                  <p className="text-sm">
                    <strong>Valor del Servicio:</strong> ${visit.serviceValue.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Valor de la Oferta:</strong> ${visit.bidValue.toLocaleString()}
                  </p>
                  {visit.remarks && (
                    <p className="text-sm mt-2">
                      <strong>Observaciones:</strong> {visit.remarks}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
