
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/contexts/ProjectContext";
import { Header } from "@/components/shared/Header";
import AdminNav from "@/components/admin/AdminNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartBarIcon, DollarSign, PercentIcon, PieChartIcon } from "lucide-react";
import type { Project } from "@/types/project";

export default function ProjectsDashboard() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Filter projects based on search query and status
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

  // Calculate total cost for a project
  const calculateProjectCost = (project: Project) => {
    let totalCost = 0;
    
    project.categories.forEach(category => {
      // Add category base cost if it exists
      if (category.cost) {
        totalCost += category.cost;
      }
      
      // Add costs from items
      category.items.forEach(item => {
        const itemTotal = (item.cost || 0) * (item.quantity || 1);
        totalCost += itemTotal;
        
        // Add IVA if it exists
        if (item.ivaAmount) {
          totalCost += item.ivaAmount;
        }
      });
      
      // Add category IVA if it exists
      if (category.ivaAmount) {
        totalCost += category.ivaAmount;
      }
    });
    
    return totalCost;
  };

  // Calculate analytics for selected projects or all filtered projects
  const analytics = useMemo(() => {
    const projectsToAnalyze = selectedProjects.length > 0
      ? filteredProjects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects;
    
    const totalCost = projectsToAnalyze.reduce(
      (sum, project) => sum + calculateProjectCost(project),
      0
    );
    
    const totalIncome = projectsToAnalyze.reduce(
      (sum, project) => sum + (project.income || 0),
      0
    );
    
    const totalMargin = totalIncome - totalCost;
    const marginPercentage = totalIncome > 0 ? (totalMargin / totalIncome) * 100 : 0;
    
    return {
      totalCost,
      totalIncome,
      totalMargin,
      marginPercentage: marginPercentage.toFixed(2),
      projectCount: projectsToAnalyze.length,
    };
  }, [filteredProjects, selectedProjects]);

  // Data for charts
  const barChartData = useMemo(() => {
    const projectsToShow = selectedProjects.length > 0
      ? filteredProjects.filter(p => selectedProjects.includes(p.id))
      : filteredProjects.slice(0, 5); // Show only first 5 projects if none selected
    
    return projectsToShow.map(project => {
      const cost = calculateProjectCost(project);
      return {
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        cost,
        income: project.income || 0,
        margin: (project.income || 0) - cost,
      };
    });
  }, [filteredProjects, selectedProjects]);

  const pieChartData = useMemo(() => {
    if (selectedProjects.length === 0 && filteredProjects.length > 0) {
      // If no specific projects selected, show category breakdown of first project
      const project = filteredProjects[0];
      return project.categories.map(category => {
        let categoryCost = category.cost || 0;
        
        // Add costs from items
        category.items.forEach(item => {
          categoryCost += (item.cost || 0) * (item.quantity || 1);
          if (item.ivaAmount) categoryCost += item.ivaAmount;
        });
        
        // Add category IVA if it exists
        if (category.ivaAmount) {
          categoryCost += category.ivaAmount;
        }
        
        return {
          name: category.name,
          value: categoryCost,
        };
      });
    } else if (selectedProjects.length === 1) {
      // If one project selected, show its category breakdown
      const project = filteredProjects.find(p => p.id === selectedProjects[0]);
      if (!project) return [];
      
      return project.categories.map(category => {
        let categoryCost = category.cost || 0;
        
        // Add costs from items
        category.items.forEach(item => {
          categoryCost += (item.cost || 0) * (item.quantity || 1);
          if (item.ivaAmount) categoryCost += item.ivaAmount;
        });
        
        // Add category IVA if it exists
        if (category.ivaAmount) {
          categoryCost += category.ivaAmount;
        }
        
        return {
          name: category.name,
          value: categoryCost,
        };
      });
    } else {
      // If multiple projects selected, show cost per project
      return selectedProjects.map(projectId => {
        const project = filteredProjects.find(p => p.id === projectId);
        if (!project) return { name: "", value: 0 };
        
        return {
          name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
          value: calculateProjectCost(project),
        };
      });
    }
  }, [filteredProjects, selectedProjects]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user?.role === "admin" && <AdminNav />}
      
      <div className="container py-8 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Dashboard de Proyectos</h1>
        </div>
        
        {/* Filters */}
        <Card className="p-4">
          <CardContent className="p-2 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Buscar por nombre o ID</label>
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Filtrar por estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="in-process">En Progreso</SelectItem>
                    <SelectItem value="on-hold">En Espera</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-blue-500" />
                Costo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalCost)}</p>
              <p className="text-xs text-muted-foreground">
                {analytics.projectCount} proyecto(s) seleccionado(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                Ingreso Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalIncome)}</p>
              <p className="text-xs text-muted-foreground">
                De {analytics.projectCount} proyecto(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-purple-500" />
                Margen Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${analytics.totalMargin < 0 ? "text-red-500" : "text-green-500"}`}>
                {formatCurrency(analytics.totalMargin)}
              </p>
              <p className="text-xs text-muted-foreground">
                Diferencia entre ingresos y costos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <PercentIcon className="w-4 h-4 mr-1 text-amber-500" />
                Margen Porcentual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${parseFloat(analytics.marginPercentage) < 0 ? "text-red-500" : "text-green-500"}`}>
                {analytics.marginPercentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                Porcentaje de margen sobre ingresos
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                Comparativa de Costos e Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="cost" name="Costo" fill="#8884d8" />
                  <Bar dataKey="income" name="Ingreso" fill="#82ca9d" />
                  <Bar dataKey="margin" name="Margen" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                Distribución de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
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
                  filteredProjects.map((project) => {
                    const cost = calculateProjectCost(project);
                    const income = project.income || 0;
                    const margin = income - cost;
                    const marginPercentage = income > 0 ? (margin / income) * 100 : 0;
                    
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
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          {project.status === "in-process" ? "En Progreso" :
                           project.status === "on-hold" ? "En Espera" :
                           project.status === "paused" ? "Pausado" :
                           project.status === "completed" ? "Completado" :
                           project.status}
                        </TableCell>
                        <TableCell>{formatCurrency(cost)}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
