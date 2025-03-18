
import { StatCard } from "./StatCard";
import { DollarSign, PercentIcon, Activity, TrendingUp } from "lucide-react";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Costo Promedio por Proyecto"
          value={formatCurrency(analytics.avgCost)}
          icon={Activity}
          iconColor="text-blue-500"
          subtitle="Media de costos entre proyectos"
        />
        
        <StatCard
          title="Ingreso Promedio por Proyecto"
          value={formatCurrency(analytics.avgIncome)}
          icon={TrendingUp}
          iconColor="text-green-500"
          subtitle="Media de ingresos entre proyectos"
        />
        
        <StatCard
          title="Margen Promedio por Proyecto"
          value={formatCurrency(analytics.avgMargin)}
          icon={TrendingUp}
          iconColor="text-purple-500"
          valueColor={analytics.avgMargin < 0 ? "text-red-500" : "text-green-500"}
          subtitle="Media de márgenes entre proyectos"
        />
      </div>
    </>
  );
}
