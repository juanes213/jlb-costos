
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/contexts/ProjectContext";
import { Header } from "@/components/shared/Header";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/formatters";
import { calculateProjectCost } from "@/utils/projectCalculations";

export default function CalendarPage() {
  const { projects } = useProjects();
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

  // Get days of the current month
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const daysOfMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Navigation between months
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
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
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="py-2 font-semibold bg-muted">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before the start of the month */}
              {Array.from({ length: firstDay.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="p-2 h-24 border border-muted"></div>
              ))}
              
              {/* Days of the month */}
              {daysOfMonth.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const hasProjects = projectsByDate[dateKey] && projectsByDate[dateKey].length > 0;
                
                return (
                  <div 
                    key={dateKey} 
                    className={`p-2 h-24 border overflow-auto ${hasProjects ? 'bg-blue-50 border-blue-200' : 'border-muted'}`}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    {hasProjects && (
                      <div className="mt-1 space-y-1 text-xs">
                        {projectsByDate[dateKey].slice(0, 2).map((project, index) => (
                          <div key={`${project.id}-${index}`} className="truncate">
                            <Link 
                              to={`/admin?projectId=${project.id}&showDetails=true`}
                              className="text-blue-600 hover:underline"
                            >
                              {project.name} 
                              {project.type === 'start' && (
                                <Badge variant="outline" className="ml-1 bg-green-100 text-green-800">
                                  Inicio
                                </Badge>
                              )}
                              {project.type === 'end' && (
                                <Badge variant="outline" className="ml-1 bg-orange-100 text-orange-800">
                                  Fin
                                </Badge>
                              )}
                            </Link>
                          </div>
                        ))}
                        {projectsByDate[dateKey].length > 2 && (
                          <div className="text-muted-foreground">
                            +{projectsByDate[dateKey].length - 2} más...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Empty cells for days after the end of the month */}
              {Array.from({ length: 6 - lastDay.getDay() }).map((_, index) => (
                index === 0 && lastDay.getDay() === 6 ? null : (
                  <div key={`empty-end-${index}`} className="p-2 h-24 border border-muted"></div>
                )
              ))}
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
                          const totalCost = calculateProjectCost(project).totalCost;
                          
                          return (
                            <div key={project.id} className="flex justify-between items-center">
                              <div>
                                <Link 
                                  to={`/admin?projectId=${project.id}&showDetails=true`}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {project.name}
                                </Link>
                                <div className="text-sm text-muted-foreground">
                                  ID: {project.numberId}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {project.type === 'start' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    Inicio
                                  </Badge>
                                )}
                                {project.type === 'end' && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                    Fin
                                  </Badge>
                                )}
                                <Badge variant={project.status === 'completed' ? 'secondary' : 'default'}>
                                  {project.status === 'in-process' ? 'En Progreso' : 
                                   project.status === 'on-hold' ? 'En Espera' : 
                                   project.status === 'paused' ? 'Pausado' : 
                                   project.status === 'completed' ? 'Completado' : 
                                   project.status}
                                </Badge>
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
