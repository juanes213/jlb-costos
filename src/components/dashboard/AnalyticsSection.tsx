
import { StatCard } from "./StatCard";
import { DollarSign, PercentIcon, Activity, TrendingUp, Calendar } from "lucide-react";
import type { Project } from "@/types/project";

interface AnalyticsSectionProps {
  analytics: {
    totalCost: number;
    totalIncome: number;
    totalMargin: number;
    marginPercentage: string;
    projectCount: number;
    avgCost: number;
    avgIncome: number;
    avgMargin: number;
    profitableProjects: number;
    unprofitableProjects: number;
  };
  formatCurrency: (value: number) => string;
}

export function AnalyticsSection({ analytics, formatCurrency }: AnalyticsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Costo Total"
          value={formatCurrency(analytics.totalCost)}
          icon={DollarSign}
          iconColor="text-blue-500"
          subtitle={`${analytics.projectCount} proyecto(s) seleccionado(s)`}
        />
        
        <StatCard
          title="Ingreso Total"
          value={formatCurrency(analytics.totalIncome)}
          icon={DollarSign}
          iconColor="text-green-500"
          subtitle={`De ${analytics.projectCount} proyecto(s)`}
        />
        
        <StatCard
          title="Margen Total"
          value={formatCurrency(analytics.totalMargin)}
          icon={DollarSign}
          iconColor="text-purple-500"
          valueColor={analytics.totalMargin < 0 ? "text-red-500" : "text-green-500"}
          subtitle="Diferencia entre ingresos y costos"
        />
        
        <StatCard
          title="Margen Porcentual"
          value={`${analytics.marginPercentage}%`}
          icon={PercentIcon}
          iconColor="text-amber-500"
          valueColor={parseFloat(analytics.marginPercentage) < 0 ? "text-red-500" : "text-green-500"}
          subtitle="Porcentaje de margen sobre ingresos"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Costo Promedio"
          value={formatCurrency(analytics.avgCost)}
          icon={Activity}
          iconColor="text-blue-500"
          subtitle="Por proyecto"
        />
        
        <StatCard
          title="Ingreso Promedio"
          value={formatCurrency(analytics.avgIncome)}
          icon={TrendingUp}
          iconColor="text-green-500"
          subtitle="Por proyecto"
        />
        
        <StatCard
          title="Proyectos Rentables"
          value={analytics.profitableProjects}
          icon={Calendar}
          iconColor="text-indigo-500"
          valueColor="text-green-500"
          subtitle={analytics.projectCount > 0 ? 
            `${((analytics.profitableProjects / analytics.projectCount) * 100).toFixed(1)}% del total` : 
            'No hay proyectos seleccionados'}
        />
        
        <StatCard
          title="Proyectos No Rentables"
          value={analytics.unprofitableProjects}
          icon={Calendar}
          iconColor="text-red-500"
          valueColor="text-red-500"
          subtitle={analytics.projectCount > 0 ? 
            `${((analytics.unprofitableProjects / analytics.projectCount) * 100).toFixed(1)}% del total` : 
            'No hay proyectos seleccionados'}
        />
      </div>
    </>
  );
}
