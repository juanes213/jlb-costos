
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { Header } from "@/components/shared/Header";
import AdminNav from "@/components/admin/AdminNav";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useChartData } from "@/hooks/useChartData";
import { formatCurrency } from "@/utils/formatters";
import { calculateProjectCost } from "@/utils/projectCalculations";

export default function ProjectsDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.numberId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const analytics = useDashboardAnalytics(filteredProjects, selectedProjects, calculateProjectCost);
  
  const { barChartData, pieChartData, scatterData, profitabilityDistribution } = 
    useChartData(filteredProjects, selectedProjects, calculateProjectCost);

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user?.role === "admin" && <AdminNav />}
      
      <div className="container py-8 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Dashboard de Proyectos</h1>
        </div>
        
        <DashboardHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        
        <AnalyticsSection 
          analytics={analytics}
          formatCurrency={formatCurrency}
        />
        
        <ChartSection 
          barChartData={barChartData}
          pieChartData={pieChartData}
          profitabilityDistribution={profitabilityDistribution}
          scatterData={scatterData}
          formatCurrency={formatCurrency}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsTable 
              filteredProjects={filteredProjects}
              selectedProjects={selectedProjects}
              toggleProjectSelection={toggleProjectSelection}
              formatCurrency={formatCurrency}
              calculateProjectCost={calculateProjectCost}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
