
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

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
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newVisit: CustomerVisit = {
      id: crypto.randomUUID(),
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

    setVisits([...visits, newVisit]);
    localStorage.setItem("customerVisits", JSON.stringify([...visits, newVisit]));
    
    toast({
      title: "Éxito",
      description: "Visita registrada correctamente",
    });
    
    setIsFormOpen(false);
    e.currentTarget.reset();
  };

  return (
    <div className="container py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Control de Visitas</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? "Cancelar" : "Nueva Visita"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="customerName" placeholder="Nombre del Cliente" required />
              <Input name="contactName" placeholder="Nombre de Contacto" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Teléfono" required />
              <Input name="serviceType" placeholder="Tipo de Servicio" required />
              <Input name="date" type="date" required />
              <Input name="startTime" type="time" required />
              <Input name="endTime" type="time" required />
              <Input
                name="serviceValue"
                type="number"
                placeholder="Valor del Servicio"
                required
              />
              <Input
                name="bidValue"
                type="number"
                placeholder="Valor de la Oferta"
                required
              />
              <Select name="status" required>
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
            <Textarea name="remarks" placeholder="Observaciones" />
            <Button type="submit">Guardar Visita</Button>
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
              <div className="text-right">
                <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  {visit.status === "pending" && "Pendiente"}
                  {visit.status === "completed" && "Completada"}
                  {visit.status === "converted" && "Convertida a OS"}
                  {visit.status === "cancelled" && "Cancelada"}
                </span>
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
  );
}
