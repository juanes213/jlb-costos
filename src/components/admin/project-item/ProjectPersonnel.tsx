
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Project, Employee, OvertimeRecord } from "@/types/project";
import { EmployeeOvertimeSelector } from "../category/EmployeeOvertimeSelector";
import { supabase } from "@/lib/supabase";

interface ProjectPersonnelProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectPersonnel({ project, onUpdateProject }: ProjectPersonnelProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract overtime records from project if they exist
  const overtimeRecords = project.categories
    .find(cat => cat.name === "Personal")?.items
    .find(item => item.name === "Horas extras")?.overtimeRecords || [];

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) {
          console.error("Error fetching employees from Supabase:", error);
          fallbackToLocalStorage();
          return;
        }
        
        if (data && data.length > 0) {
          setEmployees(data as Employee[]);
        } else {
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
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }
    };
    
    loadEmployees();
  }, []);

  const handleOvertimeRecordsSelect = (records: OvertimeRecord[]) => {
    if (!records) return;
    
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    
    const newProject = { ...project };
    
    // Find or create the Personal category
    let personalCategoryIndex = newProject.categories.findIndex(cat => cat.name === "Personal");
    
    if (personalCategoryIndex < 0) {
      // Create Personal category if it doesn't exist
      newProject.categories.push({
        name: "Personal",
        items: []
      });
      personalCategoryIndex = newProject.categories.length - 1;
    }
    
    // Find or create the overtime item within the Personal category
    const overtimeItemIndex = newProject.categories[personalCategoryIndex].items.findIndex(
      item => item.name === "Horas extras"
    );
    
    if (overtimeItemIndex >= 0) {
      // Update the existing overtime item
      newProject.categories[personalCategoryIndex].items[overtimeItemIndex] = {
        name: "Horas extras",
        cost: totalCost,
        quantity: 1,
        overtimeRecords: records
      };
    } else {
      // Create a new overtime item
      newProject.categories[personalCategoryIndex].items.push({
        name: "Horas extras",
        cost: totalCost,
        quantity: 1,
        overtimeRecords: records
      });
    }
    
    onUpdateProject(newProject);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando empleados...</div>;
  }

  return (
    <div className="space-y-4 ml-4">
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Horas extras</h4>
        <EmployeeOvertimeSelector 
          onSelect={handleOvertimeRecordsSelect}
          selectedRecords={overtimeRecords}
        />
      </div>
      
      {/* Display total cost if there are overtime records */}
      {overtimeRecords && overtimeRecords.length > 0 && (
        <div className="mt-4 text-lg font-medium">
          Costo total de personal: {formatCurrency(
            overtimeRecords.reduce((sum, record) => sum + record.cost, 0)
          )}
        </div>
      )}
    </div>
  );
}
