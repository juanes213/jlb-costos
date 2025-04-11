
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
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
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Get days for current month view
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  // Calculate days needed before the first day of month to start from Sunday (0)
  const startingDayOfWeek = getDay(firstDayOfMonth);
  
  // Generate calendar days including the padding days from previous month
  const calendarDays = [];
  
  // Add empty cells for days before the start of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the current month
  calendarDays.push(...daysInMonth);
  
  // Generate days of the week header
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
      if (!project) return 0;
      
      // Ensure project.categories is array
      if (!project.categories || !Array.isArray(project.categories)) {
        return 0;
      }
      
      const costResult = calculateProjectCost(project);
      if (typeof costResult === 'number') {
        return costResult;
      } else if (costResult && typeof costResult === 'object' && 'totalCost' in costResult) {
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
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendario Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className="text-center font-medium text-sm py-2 bg-muted"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  // Empty cell for padding
                  return <div key={`empty-${index}`} className="h-32 bg-gray-50 rounded"></div>;
                }
                
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayProjects = projectsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                
                return (
                  <div 
                    key={dateKey} 
                    className={`h-auto min-h-32 border rounded p-1 relative overflow-hidden ${
                      !isCurrentMonth ? 'bg-gray-50 opacity-60' : 
                      isTodayDate ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="text-right mb-1">
                      <span className={`inline-block rounded-full w-6 h-6 text-center text-sm ${
                        isTodayDate ? 'bg-blue-500 text-white' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    
                    <div className="space-y-1 overflow-y-auto max-h-28">
                      {dayProjects.length > 0 ? (
                        dayProjects.map((project) => {
                          const totalCost = safeCalculateProjectCost(project);
                          
                          return (
                            <div key={project.id} className="bg-white shadow-sm p-1 rounded border text-xs">
                              <Link 
                                to={`/admin?projectId=${project.id}&showDetails=true`}
                                className="font-medium text-blue-600 hover:underline block truncate"
                                title={project.name}
                              >
                                {project.name}
                              </Link>
                              <div className="flex justify-between items-center">
                                <div className="mt-1 flex-shrink-0">
                                  {getStatusBadge(project.status)}
                                </div>
                              </div>
                              <div className="mt-1">
                                <div><span className="font-medium">Costo:</span> {formatCurrency(totalCost)}</div>
                                <div><span className="font-medium">Ingreso:</span> {formatCurrency(project.income || 0)}</div>
                                <div><span className="font-medium">Fecha Final:</span> {formatDate(project.finalDate)}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-xs text-gray-400">Sin eventos</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
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
