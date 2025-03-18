
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee } from "@/types/project";
import { EmployeeForm } from "./EmployeeForm";
import { EmployeeTable } from "./EmployeeTable";
import { supabase } from "@/lib/supabase";

export function PersonnelTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        console.log("Loading employees...");
        
        const { data: supabaseEmployees, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching employees from Supabase:", error);
          fallbackToLocalStorage();
          return;
        }
        
        if (supabaseEmployees && supabaseEmployees.length > 0) {
          console.log("Employees loaded from Supabase:", supabaseEmployees);
          setEmployees(supabaseEmployees as Employee[]);
          localStorage.setItem("employees", JSON.stringify(supabaseEmployees));
        } else {
          console.log("No employees found in Supabase, checking localStorage");
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error("Error loading employees:", error);
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fallbackToLocalStorage = () => {
      const savedEmployees = localStorage.getItem("employees");
      const localEmployees = savedEmployees ? JSON.parse(savedEmployees) : [];
      setEmployees(localEmployees);
    };
    
    loadEmployees();
  }, []);

  const handleAddEmployee = async (newEmployee: Employee) => {
    try {
      if (editingEmployee) {
        console.log("Updating employee:", newEmployee);
        
        const { error } = await supabase
          .from('employees')
          .update({
            name: newEmployee.name,
            isActive: newEmployee.isActive,
            salary: newEmployee.salary,
            position: newEmployee.position,
            group: newEmployee.group,
            hourlyRate: newEmployee.hourlyRate,
            dailyRate: newEmployee.dailyRate
          })
          .eq('id', newEmployee.id);
          
        if (error) {
          console.error("Error updating employee in Supabase:", error);
          throw error;
        }
        
        const updatedEmployees = employees.map(emp => 
          emp.id === newEmployee.id ? newEmployee : emp
        );
        
        setEmployees(updatedEmployees);
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        setEditingEmployee(null);
        
        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente",
        });
      } else {
        console.log("Adding new employee:", newEmployee);
        
        const { error } = await supabase
          .from('employees')
          .insert({
            id: newEmployee.id,
            name: newEmployee.name,
            isActive: newEmployee.isActive,
            salary: newEmployee.salary,
            position: newEmployee.position,
            group: newEmployee.group,
            hourlyRate: newEmployee.hourlyRate,
            dailyRate: newEmployee.dailyRate
          });
        
        if (error) {
          console.error("Error adding employee to Supabase:", error);
          // Fallback to local storage
          const newEmployees = [...employees, newEmployee];
          setEmployees(newEmployees);
          localStorage.setItem("employees", JSON.stringify(newEmployees));
        } else {
          const { data: updatedEmployees } = await supabase
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (updatedEmployees) {
            setEmployees(updatedEmployees as Employee[]);
            localStorage.setItem("employees", JSON.stringify(updatedEmployees));
          }
        }
        
        toast({
          title: "Éxito",
          description: "Empleado agregado correctamente",
        });
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Error al guardar el empleado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting employee from Supabase:", error);
        throw error;
      }
      
      const newEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(newEmployees);
      localStorage.setItem("employees", JSON.stringify(newEmployees));
      
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el empleado",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Personal</h2>
      
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Agregar Empleado</TabsTrigger>
          <TabsTrigger value="list">Lista de Empleados</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <EmployeeForm 
            onAddEmployee={handleAddEmployee} 
            editingEmployee={editingEmployee} 
          />
        </TabsContent>
        <TabsContent value="list">
          <EmployeeTable 
            employees={employees}
            onDeleteEmployee={handleDeleteEmployee}
            onEditEmployee={handleEditEmployee}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
