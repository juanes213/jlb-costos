
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/contexts/ProjectContext";
import { Header } from "@/components/shared/Header";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/formatters";

export default function CalendarPage() {
  const { projects, calculateProjectCost } = useProjects();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Filter projects that have dates
  const projectsWithDates = projects.filter(project => project.initialDate || project.finalDate);

  // Group projects by date
  const projectsByDate: Record<string, any[]> = {};
  projectsWithDates.forEach(project => {
    if (project.initialDate) {
      const dateKey = format(new Date(project.initialDate), "yyyy-MM-dd");
      if (!projectsByDate[dateKey]) {
        projectsByDate[dateKey] = [];
      }
      projectsByDate[dateKey].push({
        ...project,
        type: 'start'
      });
    }
    
    if (project.finalDate) {
      const dateKey = format(new Date(project.finalDate), "yyyy-MM-dd");
      if (!projectsByDate[dateKey]) {
        projectsByDate[dateKey] = [];
      }
      // Only add if not already in the array for this date
      if (!projectsByDate[dateKey].find(p => p.id === project.id)) {
        projectsByDate[dateKey].push({
          ...project,
          type: 'end'
        });
      }
    }
  });

  // Navigation between months
  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // Filter projects for the current month
  const getCurrentMonthProjects = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return Object.entries(projectsByDate)
      .filter(([date]) => {
        const projectDate = new Date(date);
        return projectDate >= firstDay && projectDate <= lastDay;
      })
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
  };

  const currentMonthProjects = getCurrentMonthProjects();
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "in-process": 
        return <Badge variant="default">En Progreso</Badge>;
      case "on-hold": 
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En Espera</Badge>;
      case "paused": 
        return <Badge variant="outline" className="bg-red-100 text-red-800">Pausado</Badge>;
      case "completed": 
        return <Badge variant="secondary">Completado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy");
  };

  // Safely calculate project cost with error handling
  const safeCalculateProjectCost = (project: any) => {
    try {
      const costResult = calculateProjectCost(project);
      if (typeof costResult === 'number') {
        return costResult;
      } else if (costResult && typeof costResult === 'object') {
        return costResult.totalCost;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating project cost:", error, project);
      return 0;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Calendario de Proyectos</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vista Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentMonthProjects.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay eventos programados para este mes
                </div>
              ) : (
                currentMonthProjects.map(([date, dayProjects]) => (
                  <Card key={date} className="overflow-hidden">
                    <CardHeader className="bg-muted py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {format(new Date(date), 'dd/MM/yyyy')} - {dayProjects.length} proyecto(s)
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {dayProjects.map((project) => {
                          // Safely calculate project cost
                          const totalCost = safeCalculateProjectCost(project);
                          
                          return (
                            <div key={project.id} className="border p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <Link 
                                  to={`/admin?projectId=${project.id}&showDetails=true`}
                                  className="font-medium text-blue-600 hover:underline truncate max-w-[60%]"
                                  title={project.name}
                                >
                                  {project.name}
                                </Link>
                                <div>
                                  {getStatusBadge(project.status)}
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-1">
                                ID: {project.numberId}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Costo:</span> {formatCurrency(totalCost)}
                                </div>
                                <div>
                                  <span className="font-medium">Ingreso:</span> {formatCurrency(project.income || 0)}
                                </div>
                                <div>
                                  <span className="font-medium">Fecha Final:</span> {formatDate(project.finalDate)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(projectsByDate)
                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                .filter(([date]) => new Date(date) >= new Date())
                .slice(0, 5)
                .map(([date, dayProjects]) => (
                  <Card key={date} className="overflow-hidden">
                    <CardHeader className="bg-muted py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {format(new Date(date), 'dd/MM/yyyy')} - {dayProjects.length} proyecto(s)
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {dayProjects.map((project) => {
                          // Safely calculate project cost
                          const totalCost = safeCalculateProjectCost(project);
                          
                          return (
                            <div key={project.id} className="border p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <Link 
                                  to={`/admin?projectId=${project.id}&showDetails=true`}
                                  className="font-medium text-blue-600 hover:underline truncate max-w-[60%]"
                                  title={project.name}
                                >
                                  {project.name}
                                </Link>
                                <div>
                                  {getStatusBadge(project.status)}
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-1">
                                ID: {project.numberId}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Costo:</span> {formatCurrency(totalCost)}
                                </div>
                                <div>
                                  <span className="font-medium">Ingreso:</span> {formatCurrency(project.income || 0)}
                                </div>
                                <div>
                                  <span className="font-medium">Fecha Final:</span> {formatDate(project.finalDate)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
              {Object.entries(projectsByDate)
                .filter(([date]) => new Date(date) >= new Date()).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No hay próximos eventos programados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
