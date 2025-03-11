
import { useMemo } from "react";
import { ChartBarIcon, PieChartIcon, TrendingUp, Activity } from "lucide-react";
import { BarChartComponent } from "./charts/BarChartComponent";
import { PieChartComponent } from "./charts/PieChartComponent";
import { ScatterChartComponent } from "./charts/ScatterChartComponent";
import type { Project } from "@/types/project";

interface ChartSectionProps {
  barChartData: any[];
  pieChartData: any[];
  profitabilityDistribution: any[];
  scatterData: any[];
  formatCurrency: (value: number) => string;
}

export function ChartSection({
  barChartData,
  pieChartData,
  profitabilityDistribution,
  scatterData,
  formatCurrency,
}: ChartSectionProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  const formatCurrencyValue = (value: number) => formatCurrency(Number(value));

  // Formatter for the millions in scatter chart
  const formatMillions = (value: number) => (value / 1000000).toFixed(0) + 'M';

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartComponent
          title="Comparativa de Costos e Ingresos"
          icon={ChartBarIcon}
          data={barChartData}
          dataKeys={[
            { key: "cost", name: "Costo", color: "#8884d8" },
            { key: "income", name: "Ingreso", color: "#82ca9d" },
            { key: "margin", name: "Margen", color: "#ffc658" }
          ]}
          formatter={formatCurrencyValue}
        />
        
        <PieChartComponent
          title="Distribución de Costos"
          icon={PieChartIcon}
          data={pieChartData}
          dataKey="value"
          colors={COLORS}
          formatter={formatCurrencyValue}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartComponent
          title="Distribución de Márgenes de Rentabilidad"
          icon={TrendingUp}
          data={profitabilityDistribution}
          dataKeys={[
            { key: "count", name: "Número de proyectos", color: "#8884d8" }
          ]}
        />
        
        <ScatterChartComponent
          title="Relación Costo vs Ingreso"
          icon={Activity}
          data={scatterData}
          xDataKey="cost"
          yDataKey="income"
          zDataKey="margin"
          zRange={[50, 400]}
          name="Proyectos"
          color="#8884d8"
          xFormatter={formatMillions}
          yFormatter={formatMillions}
          formatter={formatCurrencyValue}
        />
      </div>
    </>
  );
}
