
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjects } from "@/contexts/ProjectContext";
import { Header } from "@/components/shared/Header";
import AdminNav from "@/components/admin/AdminNav";
import { formatCurrency } from "@/utils/formatters";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { DayContentProps } from "react-day-picker";

export default function CalendarPage() {
  const { projects, calculateProjectCost } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Filter projects that have dates
  const projectsWithDates = projects.filter(
    (project) => project.initialDate || project.finalDate
  );

  // Group projects by date for the selected month
  const projectsByDate: Record<string, Project[]> = {};
  
  projectsWithDates.forEach((project) => {
    if (project.initialDate) {
      const dateKey = format(new Date(project.initialDate), "yyyy-MM-dd");
      if (!projectsByDate[dateKey]) {
        projectsByDate[dateKey] = [];
      }
      projectsByDate[dateKey].push(project);
    }
    
    // Also add project on its end date if available
    if (project.finalDate) {
      const dateKey = format(new Date(project.finalDate), "yyyy-MM-dd");
      if (!projectsByDate[dateKey]) {
        projectsByDate[dateKey] = [];
      }
      // Only add if not already in the array for this date
      if (!projectsByDate[dateKey].find(p => p.id === project.id)) {
        projectsByDate[dateKey].push(project);
      }
    }
  });

  // Function to navigate between months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  // Get projects for the selected day
  const selectedDayProjects = selectedDate 
    ? projectsByDate[format(selectedDate, "yyyy-MM-dd")] || [] 
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminNav />
      
      <div className="container py-8 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Calendario de Proyectos</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar section */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Calendario</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  className="rounded-md border p-3 pointer-events-auto"
                  modifiers={{
                    withProjects: (date) => {
                      const dateKey = format(date, "yyyy-MM-dd");
                      return !!projectsByDate[dateKey];
                    },
                  }}
                  modifiersStyles={{
                    withProjects: {
                      fontWeight: "bold",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "4px",
                    },
                  }}
                  components={{
                    DayContent: (props: DayContentProps) => {
                      const dateKey = format(props.date, "yyyy-MM-dd");
                      const hasProjects = !!projectsByDate[dateKey];
                      
                      if (hasProjects) {
                        const count = projectsByDate[dateKey].length;
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative w-full h-full flex items-center justify-center">
                                {props.day}
                                <Badge 
                                  className="absolute -bottom-1 -right-1 text-xs h-4 min-w-4 flex items-center justify-center"
                                  variant="secondary"
                                >
                                  {count}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {count} {count === 1 ? 'proyecto' : 'proyectos'} 
                              {projectsByDate[dateKey].some(p => format(new Date(p.initialDate || ""), "yyyy-MM-dd") === dateKey) &&
                                " (inicio)"
                              }
                              {projectsByDate[dateKey].some(p => format(new Date(p.finalDate || ""), "yyyy-MM-dd") === dateKey) &&
                                " (fin)"
                              }
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      
                      return <>{props.day}</>;
                    },
                  }}
                />
              </TooltipProvider>
            </CardContent>
          </Card>
          
          {/* Project details for selected date */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Proyectos para ${format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}`
                  : "Selecciona una fecha"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayProjects.length === 0 ? (
                <p className="text-muted-foreground">
                  {selectedDate 
                    ? "No hay proyectos para esta fecha" 
                    : "Selecciona una fecha para ver proyectos"
                  }
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedDayProjects.map((project) => {
                    const totalCost = calculateProjectCost(project);
                    const isStartDate = project.initialDate && 
                      format(new Date(project.initialDate), "yyyy-MM-dd") === format(selectedDate!, "yyyy-MM-dd");
                    const isEndDate = project.finalDate && 
                      format(new Date(project.finalDate), "yyyy-MM-dd") === format(selectedDate!, "yyyy-MM-dd");
                    
                    return (
                      <Card key={project.id} className="overflow-hidden">
                        <CardHeader className="bg-muted pb-2">
                          <div className="flex items-center justify-between">
                            <Link 
                              to={`/admin?projectId=${project.id}&showDetails=true`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {project.name}
                            </Link>
                            <div className="flex space-x-2">
                              {isStartDate && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">Inicio</Badge>
                              )}
                              {isEndDate && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">Fin</Badge>
                              )}
                              <Badge 
                                variant={project.status === "completed" ? "secondary" : "default"}
                              >
                                {project.status === "in-process" ? "En Progreso" :
                                project.status === "on-hold" ? "En Espera" :
                                project.status === "paused" ? "Pausado" :
                                project.status === "completed" ? "Completado" :
                                project.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <dl className="grid grid-cols-2 gap-2 text-sm">
                            <dt className="font-medium text-muted-foreground">ID:</dt>
                            <dd>{project.numberId}</dd>
                            
                            <dt className="font-medium text-muted-foreground">Ingreso:</dt>
                            <dd>{formatCurrency(project.income || 0)}</dd>
                            
                            <dt className="font-medium text-muted-foreground">Costo:</dt>
                            <dd>{formatCurrency(totalCost)}</dd>
                            
                            <dt className="font-medium text-muted-foreground">Margen:</dt>
                            <dd className={project.income - totalCost < 0 ? "text-red-500" : "text-green-500"}>
                              {formatCurrency(project.income - totalCost)}
                            </dd>
                            
                            <dt className="font-medium text-muted-foreground">Fecha inicio:</dt>
                            <dd>{project.initialDate ? format(new Date(project.initialDate), "dd/MM/yyyy") : "N/A"}</dd>
                            
                            <dt className="font-medium text-muted-foreground">Fecha fin:</dt>
                            <dd>{project.finalDate ? format(new Date(project.finalDate), "dd/MM/yyyy") : "N/A"}</dd>
                            
                            {(() => {
                              const personnel: string[] = [];
                              
                              // Ensure categories is an array
                              const categories = Array.isArray(project.categories) 
                                ? project.categories 
                                : (typeof project.categories === 'string' ? JSON.parse(project.categories) : []);
                              
                              // Look for personnel category
                              const personnelCategory = categories.find(cat => 
                                cat.name.toLowerCase().includes('personal') || 
                                cat.name.toLowerCase().includes('personnel'));
                                
                              if (personnelCategory) {
                                personnelCategory.items.forEach(item => {
                                  if (item.name) personnel.push(item.name);
                                });
                              }
                              
                              return (
                                <>
                                  <dt className="font-medium text-muted-foreground col-span-2">Personal:</dt>
                                  <dd className="col-span-2">
                                    {personnel.length > 0 
                                      ? personnel.join(", ") 
                                      : "No hay personal asignado"
                                    }
                                  </dd>
                                </>
                              );
                            })()}
                          </dl>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
