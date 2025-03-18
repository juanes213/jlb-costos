
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Employee } from "@/types/project";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFormProps {
  onAddEmployee: (employee: Employee) => void;
  editingEmployee?: Employee | null;
}

export function EmployeeForm({ onAddEmployee, editingEmployee }: EmployeeFormProps) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("");
  const [group, setGroup] = useState("Produccion");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const { toast } = useToast();

  const groups = ["Produccion", "Administrativo", "Ventas", "Ingeniería"];

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setIsActive(editingEmployee.isActive);
      setSalary(editingEmployee.salary.toString());
      setPosition(editingEmployee.position);
      setGroup(editingEmployee.group);
      setHourlyRate(editingEmployee.hourlyRate.toString());
      setDailyRate(editingEmployee.dailyRate.toString());
    }
  }, [editingEmployee]);

  useEffect(() => {
    if (salary) {
      try {
        // Parse salary by removing non-numeric characters and commas
        const parsedSalary = parseFloat(salary.replace(/[^\d]/g, ""));
        
        if (!isNaN(parsedSalary)) {
          // Calculate hourly rate (salary / 30 days / 8 hours)
          const hourly = parsedSalary / 230;
          setHourlyRate(hourly.toFixed(2));
          
          // Calculate daily rate (salary / 30 days)
          const daily = parsedSalary / 30;
          setDailyRate(daily.toFixed(2));
        }
      } catch (error) {
        console.error("Error calculating rates:", error);
      }
    }
  }, [salary]);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(numericValue) || 0);
  };

  const handleSalaryChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setSalary(numericValue);
  };

  const handleSubmit = () => {
    if (!name || !salary || !position || !group) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const parsedSalary = parseFloat(salary);
    const parsedHourlyRate = parseFloat(hourlyRate);
    const parsedDailyRate = parseFloat(dailyRate);
    
    if (isNaN(parsedSalary) || isNaN(parsedHourlyRate) || isNaN(parsedDailyRate)) {
      toast({
        title: "Error",
        description: "Los valores numéricos son inválidos",
        variant: "destructive",
      });
      return;
    }

    const employee: Employee = {
      id: editingEmployee ? editingEmployee.id : crypto.randomUUID(),
      name,
      isActive,
      salary: parsedSalary,
      position,
      group,
      hourlyRate: parsedHourlyRate,
      dailyRate: parsedDailyRate
    };

    onAddEmployee(employee);

    // Reset form
    setName("");
    setIsActive(true);
    setSalary("");
    setPosition("");
    setGroup("Produccion");
    setHourlyRate("");
    setDailyRate("");
  };

  return (
    <Card className="p-6 space-y-6 bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Nombre</p>
          <Input
            placeholder="Nombre del empleado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Estado</p>
          <Select
            value={isActive ? "true" : "false"}
            onValueChange={(value) => setIsActive(value === "true")}
          >
            <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Salario</p>
          <Input
            placeholder="Salario"
            value={salary ? formatCurrency(salary) : ""}
            onChange={(e) => handleSalaryChange(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Cargo</p>
          <Input
            placeholder="Cargo del empleado"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Grupo</p>
          <Select
            value={group}
            onValueChange={setGroup}
          >
            <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Valor por Hora</p>
          <Input
            placeholder="Valor por hora"
            value={hourlyRate ? formatCurrency(hourlyRate) : ""}
            readOnly
            className="border-blue-200 focus:border-blue-400 bg-gray-50"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Valor por Día</p>
          <Input
            placeholder="Valor por día"
            value={dailyRate ? formatCurrency(dailyRate) : ""}
            readOnly
            className="border-blue-200 focus:border-blue-400 bg-gray-50"
          />
        </div>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        {editingEmployee ? "Actualizar Empleado" : "Agregar Empleado"}
      </Button>
    </Card>
  );
}
