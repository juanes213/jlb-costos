
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LucideIcon } from "lucide-react";

interface PieChartComponentProps {
  title: string;
  icon: LucideIcon;
  data: any[];
  dataKey: string;
  nameKey?: string;
  colors: string[];
  height?: string;
  formatter?: (value: any) => string;
}

export function PieChartComponent({
  title,
  icon: Icon,
  data,
  dataKey,
  nameKey = "name",
  colors,
  height = "h-80",
  formatter,
}: PieChartComponentProps) {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatter} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
