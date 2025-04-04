import { Button } from "@/components/ui/button";
import { useProjects } from "@/contexts/ProjectContext";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

export function ProjectHeader() {
  const { projects } = useProjects();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in-process":
        return "En Progreso";
      case "on-hold":
        return "En Espera";
      case "paused":
        return "Pausado";
      case "completed":
        return "Completado";
      default:
        return status;
    }
  };

  const exportToExcel = () => {
    // Transform projects data into a flat structure for Excel
    const excelData = projects.flatMap(project => {
      return project.categories.flatMap(category => {
        if (category.items.length === 0) {
          return [{
            'Project Name': project.name,
            'Project ID': project.numberId,
            'Project Income': project.income || 0,
            'Initial Date': project.initialDate ? format(new Date(project.initialDate), 'dd/MM/yyyy') : '-',
            'Final Date': project.finalDate ? format(new Date(project.finalDate), 'dd/MM/yyyy') : '-',
            'Status': getStatusLabel(project.status),
            'Category': category.name,
            'Item': '-',
            'Cost': category.cost || 0,
            'IVA': category.ivaAmount || 0,
            'Total': (category.cost || 0) + (category.ivaAmount || 0)
          }];
        }
        
        return category.items.map(item => ({
          'Project Name': project.name,
          'Project ID': project.numberId,
          'Project Income': project.income || 0,
          'Initial Date': project.initialDate ? format(new Date(project.initialDate), 'dd/MM/yyyy') : '-',
          'Final Date': project.finalDate ? format(new Date(project.finalDate), 'dd/MM/yyyy') : '-',
          'Status': getStatusLabel(project.status),
          'Category': category.name,
          'Item': item.name,
          'Cost': item.cost,
          'IVA': item.ivaAmount || 0,
          'Total': item.cost + (item.ivaAmount || 0)
        }));
      });
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Generate Excel file and trigger download
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "all-projects.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de proyectos</h1>
          <p className="text-muted-foreground">
            Cree y gestione sus proyectos
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={exportToExcel} variant="outline">
          Exportar todo a Excel
        </Button>
      </div>
    </div>
  );
}
