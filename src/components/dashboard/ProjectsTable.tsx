
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Project } from "@/types/project";
import { Link } from "react-router-dom";

interface ProjectsTableProps {
  filteredProjects: Project[];
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  formatCurrency: (value: number) => string;
  calculateProjectCost: (project: Project) => { totalCost: number; margin: number; marginPercentage: number; };
}

export function ProjectsTable({
  filteredProjects,
  selectedProjects,
  toggleProjectSelection,
  formatCurrency,
  calculateProjectCost,
}: ProjectsTableProps) {
  const [visibleRows, setVisibleRows] = useState(10);

  const loadMoreProjects = () => {
    setVisibleRows(prev => prev + 10);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Seleccionar</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Ingreso</TableHead>
            <TableHead>Margen</TableHead>
            <TableHead>% Margen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No hay proyectos que coincidan con los filtros
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.slice(0, visibleRows).map((project) => {
              // Fix: Explicitly extract and use the totalCost, margin and marginPercentage values
              const { totalCost, margin, marginPercentage } = calculateProjectCost(project);
              const income = project.income || 0;
              
              return (
                <TableRow key={project.id} className="cursor-pointer">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => toggleProjectSelection(project.id)}
                      className="w-4 h-4"
                    />
                  </TableCell>
                  <TableCell>{project.numberId}</TableCell>
                  <TableCell>
                    <Link 
                      to={`/admin?projectId=${project.id}&showDetails=true`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {project.status === "in-process" ? "En Progreso" :
                     project.status === "on-hold" ? "En Espera" :
                     project.status === "paused" ? "Pausado" :
                     project.status === "completed" ? "Completado" :
                     project.status}
                  </TableCell>
                  <TableCell>{formatCurrency(totalCost)}</TableCell>
                  <TableCell>{formatCurrency(income)}</TableCell>
                  <TableCell className={margin < 0 ? "text-red-500" : "text-green-500"}>
                    {formatCurrency(margin)}
                  </TableCell>
                  <TableCell className={marginPercentage < 0 ? "text-red-500" : "text-green-500"}>
                    {marginPercentage.toFixed(2)}%
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {filteredProjects.length > visibleRows && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={loadMoreProjects}>
            Cargar más proyectos
          </Button>
        </div>
      )}
    </div>
  );
}
