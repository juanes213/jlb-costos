
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LucideIcon } from "lucide-react";

interface BarChartComponentProps {
  title: string;
  icon: LucideIcon;
  data: any[];
  dataKeys: { key: string; name: string; color: string }[];
  height?: string;
  formatter?: (value: any) => string;
}

export function BarChartComponent({
  title,
  icon: Icon,
  data,
  dataKeys,
  height = "h-80",
  formatter,
}: BarChartComponentProps) {
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
          <BarChart
            data={data}
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
            <Tooltip formatter={formatter} />
            <Legend />
            {dataKeys.map((dataKey) => (
              <Bar 
                key={dataKey.key}
                dataKey={dataKey.key} 
                name={dataKey.name} 
                fill={dataKey.color} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
