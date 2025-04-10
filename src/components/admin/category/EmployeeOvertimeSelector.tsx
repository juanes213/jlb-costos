
import { useState } from "react";
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import { Employee, OvertimeType } from "@/types/project";
import { OVERTIME_RATES, calculateOvertimeCost } from "@/utils/overtimeRates";

interface OvertimeRecord {
  id: string;
  employeeId: string;
  overtimeType: OvertimeType;
  hours: number;
  cost: number;
}

interface EmployeeOvertimeSelectorProps {
  onSelect: (records: OvertimeRecord[]) => void;
  selectedRecords: OvertimeRecord[];
  employees?: Employee[];
}

export function EmployeeOvertimeSelector({ 
  onSelect, 
  selectedRecords,
  employees: propEmployees
}: EmployeeOvertimeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>(propEmployees || []);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("ordinary_daytime");
  const [hours, setHours] = useState<number>(1);
  const [records, setRecords] = useState<OvertimeRecord[]>(selectedRecords || []);

  // If employees were not provided as props, load them from localStorage
  if (!propEmployees) {
    useState(() => {
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }
    });
  }

  const handleAddRecord = () => {
    if (!selectedEmployee || !overtimeType || hours <= 0) return;
    
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;
    
    const cost = calculateOvertimeCost(employee.hourlyRate, overtimeType, hours);
    
    const newRecord: OvertimeRecord = {
      id: crypto.randomUUID(),
      employeeId: selectedEmployee,
      overtimeType,
      hours,
      cost
    };
    
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    onSelect(updatedRecords);
    
    // Reset form
    setHours(1);
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    onSelect(updatedRecords);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : "Empleado no encontrado";
  };

  const getOvertimeName = (type: OvertimeType) => {
    const rate = OVERTIME_RATES.find(r => r.type === type);
    return rate ? rate.name : type;
  };

  const getTotalCost = () => {
    return records.reduce((sum, record) => sum + record.cost, 0);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Select
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          >
            <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Seleccionar Empleado" />
            </SelectTrigger>
            <SelectContent>
              {employees
                .filter(emp => emp.isActive)
                .map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.position}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={overtimeType}
            onValueChange={(value: OvertimeType) => setOvertimeType(value)}
          >
            <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
              <SelectValue placeholder="Tipo de Hora Extra" />
            </SelectTrigger>
            <SelectContent>
              {OVERTIME_RATES.map((rate) => (
                <SelectItem key={rate.type} value={rate.type}>
                  {rate.name} ({rate.surchargeMultiplier}x)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="number"
            placeholder="Horas"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            min={0.5}
            step={0.5}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <Button onClick={handleAddRecord} className="w-full">
            Agregar
          </Button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo de Hora</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{getEmployeeName(record.employeeId)}</TableCell>
                  <TableCell>{getOvertimeName(record.overtimeType)}</TableCell>
                  <TableCell>{record.hours}</TableCell>
                  <TableCell>{formatCurrency(record.cost)}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                <TableCell className="font-semibold">{formatCurrency(getTotalCost())}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
