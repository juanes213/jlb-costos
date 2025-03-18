
import { useMemo } from "react";
import { ChartBarIcon, PieChartIcon, TrendingUp, Activity, BarChart3, LineChart } from "lucide-react";
import { BarChartComponent } from "./charts/BarChartComponent";
import { PieChartComponent } from "./charts/PieChartComponent";
import { ScatterChartComponent } from "./charts/ScatterChartComponent";
import { LineChartComponent } from "./charts/LineChartComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSectionProps {
  barChartData: any[];
  pieChartData: any[];
  profitabilityDistribution: any[];
  scatterData: any[];
  trendData: any[];
  formatCurrency: (value: number) => string;
}

export function ChartSection({
  barChartData,
  pieChartData,
  profitabilityDistribution,
  scatterData,
  trendData,
  formatCurrency,
}: ChartSectionProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  const formatCurrencyValue = (value: number) => formatCurrency(Number(value));

  // Formatter for the millions in scatter chart
  const formatMillions = (value: number) => (value / 1000000).toFixed(1) + 'M';

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análisis de Proyectos</h2>
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="costs">Análisis de Costos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            height="h-96"
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
            height="h-96"
          />
        </div>
      </TabsContent>

      <TabsContent value="costs" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartComponent
            title="Distribución de Costos"
            icon={PieChartIcon}
            data={pieChartData}
            dataKey="value"
            colors={COLORS}
            formatter={formatCurrencyValue}
            height="h-96"
          />
          
          <BarChartComponent
            title="Distribución de Márgenes de Rentabilidad"
            icon={TrendingUp}
            data={profitabilityDistribution}
            dataKeys={[
              { key: "count", name: "Número de proyectos", color: "#8884d8" }
            ]}
            height="h-96"
          />
        </div>
      </TabsContent>

      <TabsContent value="trends" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-blue-500" />
              Tendencia de Ingresos y Costos
            </CardTitle>
            <CardDescription>
              Evolución de costos e ingresos a lo largo del tiempo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <LineChartComponent 
              data={trendData}
              xDataKey="date"
              dataKeys={[
                { key: "cost", name: "Costo", color: "#8884d8" },
                { key: "income", name: "Ingreso", color: "#82ca9d" },
                { key: "margin", name: "Margen", color: "#ffc658" }
              ]}
              formatter={formatCurrencyValue}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
