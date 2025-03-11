
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LucideIcon } from "lucide-react";

interface ScatterChartComponentProps {
  title: string;
  icon: LucideIcon;
  data: any[];
  xDataKey: string;
  yDataKey: string;
  zDataKey?: string;
  zRange?: [number, number];
  height?: string;
  name: string;
  color: string;
  xFormatter?: (value: any) => string;
  yFormatter?: (value: any) => string;
  zFormatter?: (value: any) => string;
  formatter?: (value: any) => string;
}

export function ScatterChartComponent({
  title,
  icon: Icon,
  data,
  xDataKey,
  yDataKey,
  zDataKey,
  zRange,
  height = "h-80",
  name,
  color,
  xFormatter,
  yFormatter,
  zFormatter,
  formatter,
}: ScatterChartComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Icon className="w-5 h-5 mr-2 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey={xDataKey} 
              name={xDataKey} 
              unit=" COP"
              tickFormatter={xFormatter}
            />
            <YAxis 
              type="number" 
              dataKey={yDataKey} 
              name={yDataKey} 
              unit=" COP"
              tickFormatter={yFormatter}
            />
            {zDataKey && zRange && (
              <ZAxis 
                type="number" 
                dataKey={zDataKey} 
                range={zRange} 
                name={zDataKey} 
                unit=" COP"
              />
            )}
            <Tooltip formatter={formatter} />
            <Legend />
            <Scatter 
              name={name} 
              data={data} 
              fill={color}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
