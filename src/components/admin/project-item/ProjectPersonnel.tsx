
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import type { Project, Employee, OvertimeRecord } from "@/types/project";
import { EmployeeOvertimeSelector } from "../category/EmployeeOvertimeSelector";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Helper function to ensure categories is always an array
function ensureCategoriesArray(categories: any) {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === 'string') {
    try {
      const parsed = JSON.parse(categories);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing categories:", e);
      return [];
    }
  }
  return [];
}

interface ProjectPersonnelProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

export function ProjectPersonnel({ project, onUpdateProject }: ProjectPersonnelProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Ensure categories is an array before using find
  const categories = ensureCategoriesArray(project.categories);
  
  // Extract overtime records from project if they exist
  const overtimeRecords = categories
    .find(cat => cat?.name === "Personal")?.items
    ?.find(item => item?.name === "Horas extras")?.overtimeRecords || [];

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        console.log("Loading employees for ProjectPersonnel component...");
        
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
          // Map database column names to our TypeScript model
          const mappedEmployees = data.map(emp => ({
            id: emp.id as string,
            name: emp.name as string,
            isActive: emp.isactive as boolean,
            salary: emp.salary as number,
            position: emp.position as string,
            group: emp.group as string,
            hourlyRate: emp.hourlyrate as number,
            dailyRate: emp.dailyrate as number
          }));
          setEmployees(mappedEmployees);
          
          // Store in localStorage for future use
          localStorage.setItem("employees", JSON.stringify(mappedEmployees));
          console.log("Employees loaded from Supabase:", mappedEmployees.length);
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
      console.log("Falling back to localStorage for employees");
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        setEmployees(parsedEmployees);
        console.log("Employees loaded from localStorage:", parsedEmployees.length);
      } else {
        setEmployees([]);
        console.log("No employees found in localStorage");
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive",
        });
      }
    };
    
    loadEmployees();
  }, [toast]);

  const handleOvertimeRecordsSelect = (records: OvertimeRecord[]) => {
    if (!records) return;
    
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    
    const newProject = { ...project };
    
    // Ensure categories is an array in the newProject
    if (!Array.isArray(newProject.categories) && typeof newProject.categories === 'string') {
      try {
        newProject.categories = JSON.parse(newProject.categories);
      } catch (e) {
        console.error("Error parsing project categories:", e);
        newProject.categories = [];
      }
    } else if (!Array.isArray(newProject.categories)) {
      newProject.categories = [];
    }
    
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
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
        <span>Cargando empleados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 ml-4">
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Horas extras</h4>
        <EmployeeOvertimeSelector 
          onSelect={handleOvertimeRecordsSelect}
          selectedRecords={overtimeRecords}
          employees={employees}
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
