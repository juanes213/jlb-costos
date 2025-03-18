
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Employee } from "@/types/project";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EmployeeTableProps {
  employees: Employee[];
  onDeleteEmployee: (id: string) => void;
  onEditEmployee: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onDeleteEmployee, onEditEmployee }: EmployeeTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6 bg-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Empleados</h2>
        <div className="w-64">
          <Input
            placeholder="Buscar empleado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Salario</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Valor Hora</TableHead>
            <TableHead>Valor Día</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No se encontraron empleados
              </TableCell>
            </TableRow>
          ) : (
            filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.code}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.isActive ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>{formatCurrency(employee.salary)}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.group}</TableCell>
                <TableCell>{formatCurrency(employee.hourlyRate)}</TableCell>
                <TableCell>{formatCurrency(employee.dailyRate)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteEmployee(employee.id)}
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
  );
}
