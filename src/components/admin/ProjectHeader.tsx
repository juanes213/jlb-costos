import { Button } from "@/components/ui/button";
import { useProjects } from "@/contexts/ProjectContext";
import * as XLSX from 'xlsx';

export function ProjectHeader() {
  const { projects } = useProjects();

  const exportToExcel = () => {
    // Transform projects data into a flat structure for Excel
    const excelData = projects.flatMap(project => {
      return project.categories.flatMap(category => {
        if (category.items.length === 0) {
          return [{
            'Project Name': project.name,
            'Project ID': project.numberId,
            'Category': category.name,
            'Item': '-',
            'Cost': category.cost || 0
          }];
        }
        
        return category.items.map(item => ({
          'Project Name': project.name,
          'Project ID': project.numberId,
          'Category': category.name,
          'Item': item.name,
          'Cost': item.cost
        }));
      });
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Projects");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "all-projects.xlsx");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Project Management</h1>
        <p className="text-muted-foreground">
          Create and manage your projects
        </p>
      </div>
      <Button onClick={exportToExcel} variant="outline">
        Export All to Excel
      </Button>
    </div>
  );
}